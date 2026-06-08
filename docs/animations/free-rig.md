# Free Custom Rig for Titanfall and Apex Legends characters

In order to facilitate animating Titanfall and Apex Legends characters, a free Custom Rig is provided alongside the documentation.

Disclaimer: the Custom Rig was made in Blender 5.0.1

# What features does the Custom Rig setup have?

The Custom Rig setup consists of two armature:

1) A deformation bone armature; this rig is comprised of ONLY deformation bones (no controller bones). In order to allow the use of the second armature with bone controllers, all the bones are in a FLAT / HORIZONTAL hierarchy (no parent-child relations). For exporting a custom rig, a different template is provided (ApexTitanfallDeformationBoneArmatureForEngine.blend), which has parenting according to Respawn's conventions. This armature can be recreated by unparenting the deformation bone armature from the Empty object, making sure that the bones have the correct orientation (laid flat on the XY plane, tails facing +Y which is the standard orientation in Maya, where Y is the up axis), Applying all the constraints on the deformation bone armature provided with the Custom Rig template IN NEUTRAL POSITION (all transforms reset) and then parenting the bones according to Respawn's conventions.


2) A custom rig which includes a set of identical bones to those in the deformation armature PLUS controller bones. The bones in the deformation bone armature are all parented to their corresponding bones in the custom rig using bone constraints.

The main features of the Custom Rig setup are:
- FK (Forwards Kinematics) - IK (Inverse Kinematics) switches for the arms and legs
- IK Pole Target bones for the arms
- IK Pole Target bones for the legs
- A switch which controls whether or not the hip bone moves indepently; if this is not activated, the hip bone acts as another spine bone (the parenting of def_c_spineA to this bone is activated)
- A switch which controls whether or not the right hand is parented to the weapon bone (ja_c_propGun)
- A switch which controls whether or not the left hand is parented to the magazine bone (def_c_magazine), which in turn is parented to the weapon bone (ja_c_propGun)
- A switch which controls whether or not the magazine is parented to the weapon bone (ja_c_propGun)
- Facial bones (disclaimer: these facial bones are from Titanfall so they may not be fully compatible with Apex Legends facial bone naming / bone configurations)
- 2 helmet bones (def_c_top_helmet and def_c_bottom_helmet); these bones require a mesh with corresponding vertex groups in order to actually animate anything
- Bone collections for toggling visibility and quick selection of facial, helmet, eye, eyelid, finger, IK, weapon bones
- Left and right mirrored naming (_L and _R suffixes) for quickly mirroring poses (useful for walk cycles, run cycles, etc.)
- Easy to understand and high visibility coloring of bones
- Custom bone shapes
- Finger bone shapes that emulate Respawn's Maya finger bone shapes
- Wrist and heel bones that follow the rotation of arm and leg IK controller bones (no need to adjust wrists and heels separately)

The switches can be easily accessed by selecting the SettingsBone bone that uses as cog / gear shape, going into the Item tab and scrolling down to "Properties". All of the features with switches have been implemented using bone custom properties and bone drivers, to make it as easy and as quick as possible for the animators.

Unfortunately, by default, Blender does not allow maintaining the same World Space transforms for the limbs when switching from IK to FK. There are, however, reasonably affordable addons that allow for this, such as Transformator - Core (which, as of writing, is 19 euros on not_that_NDA's Gumroad).

Bonus elements included with the Custom Rig are:
- a first person camera
- a third person camera (can easily and quickly switch between the two by selecting the desired camera in Object Mode, going into View -> Cameras and clicking "Set Active Object As Camera" or pressing CTRL + Numpad 0 by default)
- animation reference cubes for depth and motion referencing for both first person and third person animations
- 2 area lights
- a default action called "KeyingSet" which has every bone keyed on the first frame; duplicate this action and rename it when starting a new animation

The 3D Cursor and the Armatures are positioned at the World Origin. This is the standard way of animating. When creating your animation, you should ALWAYS keep the jx_c_delta (root) bone at the World Origin, UNLESS you are an advanced animator and KNOW what you're doing! Moving the root bone will result in offsets when playing the animation on a model. There are no hard rules in animation, but whenever you decide to stray away from the guidelines, you should always have a rationale for it.

By default, the armature supports:
- A first person camera bone (the largest yellow cube)
- A generic weapon (the second largest yellow cube, propGun). This allows for control of the root bone of any gun (provided that you set the corresponding vertex group to control all vertices with a weight of 1.0). The 2 other generic weapon bones "weapon_bone" and "def_c_base" are also included, but hidden by default to reduce visual clutter
- Bones for the Pro Screen
- Bones for optics (ja_ads_attchment)
- The Smart Pistol (the yellow cubes; the bone for BT's Core from the singleplayer campaign is also included)
- The Mastiff (the purple cubes)
- The Data Knife (the black cubes)

By default, all bones are displayed On Top and with Axes (remember that, in Blender, unlike in Maya, bone orientation will ALWAYS be towards +Y!).

In the Animation window configuration, hovering on the camera view with Blender focused and pressing ALT + SHIFT + Z will reveal composition guides (diagonal lines, the camera's center, etc.). This shortcut can also be used in the main view to toggle the visibility of bones, text, etc. and help reduce visual clutter.

# How is the Custom Rig meant to be used?

Respawn's naming convention:

jx = generic joint
pov = Point of View, the actual camera bone; this bone must always be 63 units above the root bone (traditional height for Source characters)
c = center
l = left
r = right
B at the end of a bone's name = bend, used to fix mesh warping / distortions on some poses
twist = twist bones, used to fix mesh warping / distortions on some poses when it is necessary to rotate the forearms or shoulders; each shoulder has a twist bone (_shoulderTwist) and each elbow has a twist bone (_forearm). The forearm twist bones can easily be selected either from the Outliner or by double clicking on the elbow bones towards the end of the forearm.

Each finger has 3 carpal bones, labelled with A, B and C.
The ring finger and the pinky finger are attached to a ringCarpal bone.
Each hand has a dummy hand bone called "propHand". They are useful for creating attachment points (see the Valve Developer Wiki article on $attachments).
The main head bone is def_c_neckA.
By default, on weapon meshes, the bone which controls all vertices is "def_c_base". The main weapon bone used in the Custom Rig is ja_c_propGun BUT weapon_bone and def_c_base ARE included, just hidden by default. To unhide them, press ALT + H in Pose Mode (unhides all bones). This will also unhide the finger helper bones used for Apex Legends humanoid characters. They are not super important.
If the rotation of the arms / elbows looks wrong / unnatural, move their corresponding 
When turning the character model 180 degrees, make sure the IK Pole Target bones are positioned correctly (they should switch places). Make sure the IK Bones are in the correct positions.
Humanoid characters have dummy weapon bones (i.e.: ja_c_propGun) in order to allow animators to animate weapon models and player models in harmony. Weapon armatures have dummy humanoid character bones (i.e.: propHand left and right, etc.) to allow for the animation of character models together with weapons, in harmony. The vertex groups that these dummy bones control are shared across weapon and character meshes, thus allowing for weapon models to be animated in tandem with character models.
Apex Legends humanoid characters have an additional hand bone called "outterwrist" (Respawn's typo).
If you cannot see a bone, it might be inside another bone.

When you are done creating your animation, go to the Edit menu and uncheck "Lock Object Modes", then go into Object Mode and deselect everything either by clicking on an empty space or pressing ESCAPE.
Afterwards, select the Custom Rig in Object Mode and go into Pose Mode.
Then, select the deformation bone armature in Object Mode and go into Pose Mode
With the deofrmation bone armature selected in Pose Mode, create a new action for it and name it.
Then, select all the bones with A and go into Pose -> Animation -> Bake Action.. and bake the animation with the following settings:
- Only Selected Bones
- Visual Keying
- Clear Constraints
- Clear Parents
Leave all the other settings on DEFAULT, unless you are an advanced animator and know what you're doing!
Click OK and wait for the animation to be baked on every frame.
Afterwards, you are ready to export the animation as an .SMD (plaintext) or .DMX (binary) file, using Blender Source Tools and going to the Scene properties. This exported file can then be compiled into a Valve MDL v49 file and then converted into a .RRIG and .RSEQ(s) using SomeoneAteMyLastSliceOfPizza's R5-AnimConv.