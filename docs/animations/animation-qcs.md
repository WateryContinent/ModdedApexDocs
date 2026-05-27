# Writing .QCs

# Introduction

The bread and butter of Source engine animations are $sequences. They allow access to advanced animation sequence configuration.

ALL animations used in $sequences MUST be declared BEFORE they are used in $sequences, with $animation

Animation data can be stored and imported as either .SMDs (Studiomodel Data, where Studiomdl is Valve's proprietary model compiler, models which can have mesh vertex data or be animation-only) or .DMX (Data Model eXchange, a BINARY format).

The .SMD format is old and limited (bone number, etc.), but plaintext and very easily human-readable, while .DMX has extended limits and more advanced features but is non-human-readable, due to it being binary.

Some limits of SMD have been extended with modified versions of studiomdl.exe like nekomdl and tools like Blender Source Tools, while warning about the limits, allow importing rigs with more than 128 bones into Blender.

In order to extract .QC, .SMD or .DMX files it is necessary to use RSX (ReSource eXtractor by r-exx) on SMD / DMX mode.

# Raw animations

ReSource uses the "class"-styled declaration of $sequences instead of accessing skeletal anims directly:

```
$animation "ptpov_mastiff_pullout__0" "anims_ptpov_mastiff/ptpov_mastiff_pullout_dmx__23B23FF0.smd" {
	fps 30.000000
	autoik
}
```

In ReSource, animations are declared with this format (although an alternative exists), with the path root being the folder the .QC is in:

```
$animation "ANIMATION_ALIAS" "path/to/animation.smd" (or .dmx) {

	fps 30 // default
	 // other optional commannds

}
```

Example:

```
$animation "ptpov_mastiff_pullout__0" "anims_ptpov_mastiff/ptpov_mastiff_pullout_dmx__23B23FF0.smd" {
	fps 30.000000
	autoik
}
```

Animations can be declared as looping, as well:

```
$animation "ptpov_mastiff_idle__56" "anims_ptpov_mastiff/ptpov_mastiff_idle_dmx__loop_sub_ptpov_mastiff_ads_in_dmx_E2321416.smd" loop {
	fps 30.000000
	//subtract ""
	noautoik
}
```

Animations can also be declared as "delta animations" (subtracted animations to be played concomitantly on top of other animation sequences instead of overriding them) with "subtract, for use in the process of blending animation layers".

In other Source games, delta animations are usually declared with "subtract", proceeded from the name of the animation that they should be subtracted from. Afterwards, they MUST be used in $sequences which contain the "delta" command.

However, Respawn directly bakes the separate layers in Maya, so it is not necessary to use the engine to subtract them from other animations. In turn, when exporting .QCs and .SMDs from their .RMDLs, .RRIGs and .RSEQs with RSX, "subtract" is commented out:

```
$animation "zeroanim" "anims_ptpov_mastiff/zeroanim.smd" {
	fps 30.000000
	//subtract ""
	noanimation
	noautoik
}
```

Finally, animations can also be declared as effect-less (noanimation - forced zero-weights). This is useful for creating composite sequences consisting only of added or blended layers:

```
$animation "zeroanim" "anims_ptpov_mastiff/zeroanim.smd" {
	fps 30.000000
	//subtract ""
	noanimation
	noautoik
}

// declaring the other animation layer

$animation "ptpov_wind_effect__79" "anims_ptpov_mastiff/ptpov_wind_effect_dmx__subspln_4004C21E.smd" {
	fps 30.000000
	//subtract ""
	noautoik
}

// using the animation for blending

$sequence "wind_effect_layer" {
	"zeroanim" "ptpov_wind_effect__79" // two different $animations, side by side
	blendwidth 2
	blend "velocity" 200.000000 500.000000
	delta
	autoplay
}
```


In this example, in place of default or manual blending, the blending of the two animations (no animation - so unaffected - and the full effect animation layer) is controlled by a $poseparameter, declared earlier in the .QC:

```
$poseparameter "velocity" 0.000000 500.000000
```

In this situation,

```
blend "velocity" 200.000000 500.000000
```

tells the engine that the blending has the same intensity from 0 - 200 of the "velocity" pose parameter (the starting value), after which blending from the value of 200 to the value of 500 between the unaffected pose and the maximum intensity pose is done using linear interpolation, as a function of the "velocity" pose parameter, which receives its value from the in-engine player velocity parameter. This paradigm is very similar to RTPCs (Real-Time Parameter Controls) in Audio middleware like Wwise, although Wwise allows for very advanced, customizable interpolation instead of only linear interpolation (also known as "lerping").

$poseparameter min and max values are defined arbitrarily (no min or max value limits from the .QC format), although they should have some meaning inside the engine or inside VScripts.

Additionally, already existing pose parameters for a rig can be inspected by opening the RRIG with an RMDL Binary Template.

Pose parameters can also be configured so that the animation loops back on itself (restarts from the beginning) with "loop", such as for vehicle wheels rotating, for example:

```
$poseparameter wheels -180 180 loop 360
```

It is also possible to have $poseparameter values wrap around using "wrap". Values less than min wrap around to max, etc.

# Animation Sequences 

This section will feature an overview of animation sequences.

As previously mentioned, $animations are used inside $sequences

There are 2 possible ways to use $sequences, but RSX exports $sequences in this format:

```
$sequence "SEQUENCE_NAME" {
	// animation(s) used
	// activity name
	// optional commands
}
```

Here is an example from the Mastiff's viewmodel (first person model) rig:

```
$sequence "draw" {
	"ptpov_mastiff_pullout__0" // Point 1
	"ptpov_mastiff_pullout_crouch__1" // Point 1
	blendwidth 1 // Point 2
	blend "crouchFraction" 0.000000 1.000000 // Point 3
	activity "ACT_VM_DRAW" 1 // Point 4
	node "twohanded" // Point 5
	{  event "AE_CL_PLAYSOUND" 0 "weapon_mastiff_equip" } // Point 6
	{  event "AE_WPN_READYTOFIRE" 16 } // Point 6
}
```

Additional sections will delve deeper into the elements contained in this $sequence, which are:

```
1) $animations used by the $sequence
2) The amount of columns the blend contains (the number of rows is determined automatically)
3) Assigning the crouchFraction $poseparameter to control the blend interpolation, from the min value of 0 to the max value of 1 
4) The activity that the $sequence is assigned to (activities are indirected names / aliases that animations are grouped under) and the weight for this specific $sequence (out of all the $sequences grouped under the specific activity, where the weight of each $sequence = the weight of the sequence / the sum of all the weights of all the $sequences grouped under the specific activity)
5) The transition node that the $sequence is grouped under. It is possible to assign transition animations between different nodes. If a transition node is not specified, the $sequence is assigned to the root node. By default, the root node has no transition animations to and from it.
6) Animation events - these are flags set at a specific frame in an animation sequence which communicate to the engine that an event is supposed to take place at that specific frame. Animation events are prefixed with AE_, are preceded by the keyword "event" and are encased in curly brackets {}. There are very many possible Animation Events. The two Animation Events used in this $sequence are the Clientside Play Sound Event flag and the Weapon Ready To Fire flag. The flags type is succeeded by the frame number it is activated on. Other arguments can follow, such as the name of the Sound Event, for Play Sound Event Animation Events. **Frames start from 0!**
```

Let us investigate another $sequence:

```
$sequence "reload_empty_late1_onehanded" "ptpov_mastiff_onehanded_reload_empty__16" {
	activity "ACT_VM_ONEHANDED_RELOADEMPTY_LATE1" 1
	blendlayer  "run_layer_reload" 0 0 0 0 poseparameter "sprintfrac"
	{  event "AE_WPN_SEGMENTED_RELOAD_ENTER_LOOP" 17 }
	{  event "AE_CL_PLAYSOUND" 25 "Weapon_Mastiff_Reload_LoadShell" }
	{  event "AE_WPN_READYTOFIRE" 17 }
}
```

This $sequence showcases another important element used in $sequences: blendlayer

The blendlayer command signals to the engine that an $sequence is meant to be used additively, as a layer on top of other animations, in this case the "run_layer_reload" $sequence, defined here:

```
$sequence "run_layer_reload" "ptpov_mastiff_run_layer__32" loop {
	delta
}
```

This sequence has the "loop" keyword, meaning it is meant to play in a loop, indefinitely, when activated, and the "delta" keyword, meaning that it is meant to be used as a layer to play on top of other animations instead of overriding them

This line:

```
blendlayer  "run_layer_reload" 0 0 0 0 poseparameter "sprintfrac"
```

signifies the following:

```
1) "Play this animation sequence additively"
2) "Here is the $sequence to play"
3) "Start at 0% intensity on this frame"
4) "Reach 100% intensity on this frame"
5) "Start fading away on this frame"
6) "Fully fade out on this frame"
7) "Ignore the default blend behavior, allow a $poseparameter's value to control the blending"
8) "Here is the $poseparameter whose value should control the blend behavior"
```

If a $poseparameter is specified, then the 4 numbers are switched to $poseparameter values instead of frames of the parent $sequence.

In addition to the aforementioned options for $sequences, they can also feature:

- A specified fade-in time for transitions between animations (floating point number signifying the time in seconds, with the default at 0.2 = 200 ms)
- A specified fade-out time for transitions between animations (default 0.2 s = 200 ms)
- A loop command
- Activity modifiers
- A transition specifier to define which nodes the animation sequence is meant to transition between

And other options which are not used in Respawn games, but are supported by the Source engine.


# Animation Events

As described above, Animation Events are flags inside animation $sequences that communicate to the engine that a specific event is meant to take place at the respective frame. The list of possible events is very broad, from triggering Audio Events to play, to spawning Particle Effects, to creating Client-Sided Props, to sending code Signals to VScript Threads!

The format for Animation Events is this:

```
{ event "AE_ANIMATION_EVENT_NAME" framenumber "OPTIONAL ARGUMENT" }
```

There are very many Animation Events, but the some of the most important are:

```
Unless specifically mentioned, only 1 argument, the frame number, follows after the Animation Event type!

Some Animation Events are inherited from Valve, others were implemented by Respawn

Frames start from 0!

Keywords:

AE = Animation Event
WPN = Weapon
CL = Clientsided / Client-only
SV = Serversided / Server-only
VSCRIPT = Valve's Scripting System, which uses a modified version of the Squirrel scripting language in Respawn's games, known as ReSquirrel or Squirrel_Re
CALLBACK = From "Callback functions" in programming, these Animation Events call a function from the game's VScripts when they are triggered

For organization purposes, the events have been grouped by the type of function they server rather than the type of VM they are associated with (CLIENT or SERVER):

AE_WPN_READYTOFIRE // frame that the weapon / ability can be fired on; until this is signalled, the player cannot fire the weapon / use the ability
```

Apex Legends has a Segmented Reload system.
This means that after you complete a segment of the animation (a.k.a. reach a "milestone"), the engine remembers and if you switch to doing another action, you can resume the reload from the beginning of that milestone. This also applies to weapons like the Mastiff and 30-30 Repeater which have looping individual shell / round reloading which you can cancel to shoot, for example, however their mechanisms are different from those of automatic weapons.

```
AE_WPN_RELOAD_MILESTONE_1 // frame that the first segmented reload milestone is reached on (might be magazine insert for automatic weapons)
AE_WPN_RELOAD_MILESTONE_2 // frame that the second segmented reload milestone is reached on (might be racking the charging handle for automatic weapons)
AE_WPN_FILLAMMO // callback to refill the ammo of the weapon
AE_WPN_SEGMENTED_RELOAD_ADD_AMMO // frame to add 1 round of ammo on for segmented reloads like the Mastiff's or the 30-30 Repeater's
AE_WPN_SEGMENTED_RELOAD_ENTER_LOOP // frame to enter the segmented reload loop on (in this case, the reload loops until n-1, where n is the magazine capacity. When n is reached, the end animation is played)
AE_WPN_SEGMENTED_RELOAD_LOOP_LOCK_FIRE // frame of segmented reload animation sequence that the player can no longer fire at
AE_WPN_SEGMENTED_RELOAD_LOOP_CANRESTART // frame of the looping segmented reload animation sequence that the animation can restart at
```

```
AE_CL_PLAYSOUND // frame to play a client-sided only sound at, followed by a 3rd parameter which is the name of the Sound Event (NOT audio clip!)
AE_CL_PLAYSOUND_FOR_TYPE 
```

For AE_CL_PLAYSOUND_FOR_TYPE, the 3rd argument is the type of sound assigned to a legend in their own settings file; this is useful and necessary for making generic animations because each different character has their own voicelines corresponding to specific event types, such as throwing a grenade. Crypto and Wraith, for example, won't have the same Audio Event with the same name, for voicelines corresponding to the same actions. Therefore, it is up to the game engine to resolve which character the animation sequence is being executed on and decide which Audio Event should Play.

```
Example: 

{  event "AE_CL_PLAYSOUND_FOR_TYPE" 0 "effort_climb_1p" }
```

This is for a generic wall climb animation sequence. If you're playing Wraith, a Wraith voiceline of the type "effort_climb_1p" will be played. 
This is so that Respawn didn't have to create a separate, identical animation sequence playing a specific Audio Event for every single character in the game, which would've been extremely redundant and very time-consuming, considering how many legends there were, without even taking into consideration future expansions of the game's legend roster.

```
AE_CL_STOPSOUND // frame to stop a client-sided only sound at, followed by a 3rd parameter which is the name of the Sound Event (NOT audio clip!) 
```

```
AE_CL_CREATE_PROP 
```

The 3rd parameter is complicated and not well understood, but it seems to be an identifier such as "p@" followed by a hexadecimal sequence, followed by the prop's RMDL model, then the attachment point for it to be parented to on the RRIG the animation sequence is played on, all encased in quotation marks. The hexadecimal sequence is not the GUID corresponding to the prop's model in an RPAK. This animation event is responsible for communicating to the engine when, during an animation, a Client-Sided Prop is meant to spawn, which model it should use, and which attachment point it should be attached to, so that it ca follow its movements

```
Example:

{  event "AE_CL_CREATE_PROP" 0 "p@0x821967F4FD93D_0 mdl/weapons/shuriken/w_shuriken.rmdl KNIFE" }
{  event "AE_CL_CREATE_PROP" 0 "p@0x21D3DC33DDD32_0 mdl/props/health_injector/health_injector.rmdl KNIFE animseq/health_injector/dmx/animation/prop_health_injector_short.rseq" }

AE_CL_DESTROY_PROP // 3rd parameter is only the identifier with the GUID, i.e. "p@0x821967F4FD93D_0"
```

```
AE_GROUNDCONTACT_L

Example:

{  event "AE_GROUND_CONTACT_L" 0 "LandSweetener_High" }
```

```
AE_CL_CREATE_PARTICLE_EFFECT // 3rd parameter are the Particle Effect's name, its behavior (follow, no follow, etc.) and the attachment point it should spawn on, all encapsulated in quotation marks

Example:

{  event "AE_CL_CREATE_PARTICLE_EFFECT" 45 "P_skit_electric_sparks_blast follow_attachment ATTACH_USB" }

In order to stop a particle effect, use AE_CL_STOP_PARTICLE_EFFECT

Example:

{ event AE_CL_STOP_PARTICLE_EFFECT 560 "P_interior_Dlight_blue_MED_intro" }
```

```
AE_CL_VSCRIPT_CALLBACK // special Animation Event, calls a CLIENT-ONLY function registered in VScripts, the function name is the 3rd parameter - CLIENT ONLY, SO COSMETIC / PRESENTATION!

Examples:

{  event "AE_CL_VSCRIPT_CALLBACK" 0 "muzzle_flash" }
{  event "AE_CL_VSCRIPT_CALLBACK" 0 "shell_eject" }
{  event "AE_CL_VSCRIPT_CALLBACK" 0 "ammo_update" }
{  event "AE_CL_VSCRIPT_CALLBACK" 38 "remoteturret_fadeout" }

AE_SV_VSCRIPT_CALLBACK // special Animation Event, calls a SERVER-ONLY function registered in VScripts, the function name is the 3rd parameter - SERVER ONLY, MEANING AUTHORITATIVE GAME LOGIC! However, this includes some cosmetic features such as force toggling a bodygroup on models,  including player models or partially cosmetic features such as playing server-wide sounds (everyone can hear them)

Examples:

{  event "AE_SV_VSCRIPT_CALLBACK" 11 "signal:GrappleYank" }
{  event "AE_SV_VSCRIPT_CALLBACK" 1 "PlaySound_DataKnife_HackComplete_Console_Pt1_3p" }
{  event "AE_SV_VSCRIPT_CALLBACK" 31 "set_body_group:l_hand_usb:1" }
{  event "AE_SV_VSCRIPT_CALLBACK" 31 "set_body_group:l_hand:1" }
{ event AE_SV_VSCRIPT_CALLBACK 320 "dropship_deploy" }
```

Animation Window Animation Events are probably the most complicated type of events. 
Respawn almost certainly created Animation Window settings files to be able to have granular control over what happens during animation sequences, so as to be able to make advanced animations. 
These Animation Windows settings files allow for deep configuration of events that happen during animations. 
They can contain settings for which props to create, which kind of UI elements to use, sounds to play and more.

```
The format is:

{ event "AE_CL_SCRIPT_ANIM_WINDOW_BEGIN" framenumber " UNKNOWN_SEQUENCE path/to/animation/window/settings/file.rpak }

Example:

{  event "AE_CL_SCRIPT_ANIM_WINDOW_BEGIN" 0 "pathfinder_antenna_hack_start w@0x6CB21C5487175_0 settings/scriptAnimWindow/sound_ptpov_pathfinder_antenna_hack_start.rpak" }

Contents of the settings file:

{
	"layoutAsset": "settings_layout/settings_scriptAnimWindowArguments_PlaySound_layout.rpak",
	"settings": {
		"assetName": "settings/scriptAnimWindow/sound_ptpov_pathfinder_antenna_hack_start.rpak",
		"devDescription": "",
		"type": "PlaySound",
		"soundEventName": "pathfinder_antenna_hack_start"
	}
}

In order to end an Animation Window:

{  event "AE_CL_SCRIPT_ANIM_WINDOW_END" 0 "pathfinder_antenna_hack_start w@0x6CB21C5487175_0 settings/scriptAnimWindow\sound_ptpov_pathfinder_antenna_hack_start.rpak" }

```

# Blend Sequences & Animation Matrices 


The Source engine allows for the creation of Animation Matrices inside $sequences, for example, for blending animations pointing in a certain direction:

```
NW-----N-----NE

W------C------E

SW-----S-----SE
```

A an Animation Matrix, just like a mathematical matrix, has columns and rows. The rows are determined automatically, while the number of columns is controlled by the command "blendwidth".


```
$sequence "Aim_dataknife_AIM" {
	"ptpov_playback_sos_console_hack_poses__0" "ptpov_playback_sos_console_hack_poses__1" "ptpov_playback_sos_console_hack_poses__2"
	"ptpov_playback_sos_console_hack_poses__3" "zeroanim" "ptpov_playback_sos_console_hack_poses__5"
	"ptpov_playback_sos_console_hack_poses__6" "ptpov_playback_sos_console_hack_poses__7" "ptpov_playback_sos_console_hack_poses__8"
	blendwidth 3
	blend "aim_yaw" -60.000000 60.000000
	blend "aim_pitch" -45.000000 45.000000
	delta
}
```

In this animation matrix , the matrix is:

```
X = ptpov_playback_sos_console_hack_poses_

X0--------X1--------X2
X3-----ZEROANIM-----X5
X6--------X7--------X8

ZEROANIM = The animation layer that plays on top of other animations
does not affect the other animations, therefore ZEROANIM = 0 effect
```

Two typical uses of Animation Matrices are blending between animations pointing in different directions for walking, running and aiming.

In the Animation Matrix Blend Sequence presented above, the raw animations are deliberately extended to the extremes and blending between them is controller by $poseparameters whose values are determined by the player's look vector yaw and pitch 

The "delta" command designates the $sequence as a "delta animation" sequence, meaning it is to be played as a layer on top of other animations instead of overriding them. The word delta comes from the mathematical meaning of "delta": a difference. The delta animations are "partial animations" (they are not designed as standalone animations) added to animations to create dynamic composited sequences. They can be thought of similarly to "Blend Shapes" / "Shape Keys" in Blender, being extra layers which have controllers that affect how much those layers influence the currently playing animations and the degree to which these extra layers are added on top.

# Transition Nodes

If an animation sequence should expressly not use any transitions to other animation sequences, it is possible to skip any existing transitions with the "snap" or "$skiptransition" command. The skiptransition command must be used outside of $sequences, as indicated by its dollar sign prefix. This command adds a rule to not play any transition animations between two transition nodes and allows for smooth transitioning between different player states, like walk -> stand -> run, instead of walk -> run.

Here is an example of transitions:

```
// Declare the nodes and which $sequences belong to it

$sequence "idle" {
	"ptpov_mastiff_idle__56" "ptpov_mastiff_ads_idle__57"
	blendwidth 2 // 2 blend columns
	blend "ads_blend" 0.000000 1.000000 // blending controlled by the $poseparameter "ads_blend"
	activity "ACT_VM_IDLE" 1 // assigned to the "ACT_VM_IDLE" activity with a weight of 1
	node "idle" // assigned to the transition node "idle"
	loop // force loop 
	delta // declare $sequence as a delta sequence to be layered on top of other animations which are playing
}

$sequence "idle_crouch" {
	"ptpov_mastiff_idle_crouch__59" "ptpov_mastiff_ads_idle__60"
	blendwidth 2
	blend "ads_blend" 0.000000 1.000000
	activity "ACT_VM_IDLE" 1
	activitymodifier  "crouch"
	node "crouch"
	loop
	delta
}

$sequence "crouch_to_idle" {
	"ptpov_mastiff_regrip__45" "ptpov_mastiff_ads_idle__46"
	blendwidth 2
	blend "ads_blend" 0.000000 1.000000
	transition "crouch" "idle"  
    // Declare that this animation is meant to bridge animation sequences belonging to the "crouch" node to sequences belonging to the "idle" node
	delta
}
```

Therefore, it can be summed up as such:

Transition nodes represent groups of animation sequences, much like activities, which have specific transition animations assigned to and from them.

There is always an implicit, undeclared root node which does not have any transition animations to and from it.

"snap" forces no blending to this animation sequence.

"fadein" and "fadeout" are blending options for transitioning between animations. By default, they are set to 0.2 s = 200 ms.

# Activities and Activity Modifiers

As aforementioned, activities represent an alias for groups of associated animation sequences.
The weight of a $sequence associated with an Animation Activity represents the likelihood that the specific $sequence will be chosen to play when a certain activity is triggered.
The probability that a specific $sequence will play is: weight of $sequence / sum of the weights of all $sequences.

Activity modifiers allow for the setting of additional conditions for when an animation sequence should play. If those conditions are met, the animation sequences are played.

For instance, this $sequence is specific to and should only play on Caustic and Gibraltar:

```
$sequence "sprint" "ptpov_mastiff_sprint_noroll__74" loop {
	activity "ACT_VM_SPRINT" 1 // animation sequence put in the viewmodel sprinting activity group
	activitymodifier  "pilot_survival_gunner" // Gibraltar
	activitymodifier  "pilot_survival_gas" // Caustic
}
```

Below are more examples:

```
$sequence "sprintjump" "ptpov_mastiff_sprint_jump__35" {
	activity "ACT_VM_RAISE_FROM_SPRINT" 1
	activitymodifier  "air" // Only play mid-air
	node "twohanded"
	fadein 0.100000
	{  event "AE_WPN_READYTOFIRE" 10 }
	{  event "AE_CL_PLAYSOUND" 0 "weapon_mastiff_raise" }
}

$sequence "sprintslide" "ptpov_mastiff_slide__38" {
	activity "ACT_VM_RAISE_FROM_SPRINT" 1
	activitymodifier  "sliding" // Only play when sliding
	node "twohanded"
	{  event "AE_WPN_READYTOFIRE" 7 }
	{  event "AE_CL_PLAYSOUND" 0 "weapon_mastiff_raise" }
}

$sequence "ads_out_wallrun_onehanded" "ptpov_mastiff_onehanded_ads_out__44" {
	activity "ACT_VM_ONEHANDED_ADS_OUT" 1
	activitymodifier  "wallrun" // Only play when wallrunning
	blendlayer  "run_wall_layer" 0 0 0 0
}
```

The list of Activities and Activity Modifiers is very long and can be found in the main animations document.

# Other Animation Commands

"autoplay" forces the animation to play on top at all times, irrespective of whatever other animation sequences may be playing. This command is very useful for blend sequences such as wind rush layers. Respawn very often used it for this purpose.

