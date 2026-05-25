# Player Entity Methods and Functions


GetPlayerArray() // the local player is ALWAYS the first element of the returned array, meaning the easiest way to get the local player is with GetPlayerArray()[0] or the shorthand gp()[0]
GetPlayerArray_Alive()
GetPlayerArray_AliveConnected() // for iterating / indexing with for or foreach( alivePlayer in ... )
GetPlayerArrayOfTeam( player.GetTeam() )
GetPlayerArrayOfTeam_AliveConnected( player.GetTeam( ) )
GetPlayerTitansOnTeam( player.GetTeam() ) // the team is an int value
GetPlayerTitansReadyOnTeam( player.GetTeam() ) // the team is an int value
GetLocalViewPlayer()
GetLocalClientPlayer()
player.GetActiveWeapon( eActiveInventorySlot.SLOTNAME )
player.GetPlayerName()
player.GiveNormalWeapon()
player.TakeNormalWeapon()
player.TakeWeapons()
holster take weapons?
localViewPlayer.GetCockpit() // GetLocalViewPlayer().GetCockpit(), gets the player's first person "screen" / "hull" / "cockpit" entity
player.GetTeam()
player.SetTeam()
IsPlayer
IsPilot
player.GetPlayerNetInt( "tutorialContext" )
player.GetPlayerNetBool( "skydiveFreelookActive" )
player.GetPlayerNetEnt( "revivePlayerHealer" )
player.GetPlayerSettings()
player.GetPlayerSettingsMods()
player.GetPlayerModsForPos( pose )
SURVIVAL_GetPlayerInventory( entity player )
SURVIVAL_Loot_GetLootDataByIndex( itemSurvivalint ) // lootItem.GetSurvivalInt()
SURVIVAL_CountItemsInInventory( weapon.GetOwner() info.lootData.ref )
SURVIVAL_AddToPlayerInventory( entity player, string(?) lootRef, int amount)
SURVIVAL_RemoveFromPlayerInventory( player, vaultData.vaultKeylootType, 1 )
SURVIVAL_GetPrimaryWeaponsSorted( ownerPlayer )
SURVIVAL_GetLastActiveWeapon (player )
SURVIVAL_PlayerAllowedToPickup( player )
SURVIVAL_IsPlayerCarringLoot( player )
HolsterAndDisableWeapons( player )
DeployAndEnableWeapons( player )
player.HolsterWeapon()

GetPlayerUID()
weapon.GetWeaponOwner()
weapon.GetOwner()
weapon.GetParent()
GetPlayerFromTitanWeapon( entity weapon )




player.GetOrigin()
player.CameraPosition()
player.CameraAngles()
player.GetAngles()
player.IsCrouched()
player.ContextAction_IsActive()
player.IsDoubleJumping()
player.GetHealth()
player.GetShieldHealth()
player.IsMantling()
player.ClearTraverse() // finish mantling?

player.GetOffHandWeapon( int offhandSlot )

decoy.SetDeathNotifications( false )
decoy.SetPassThroughThickness( 0 )
decoy.SetNameVisibleToOwner( true )
decoy.SetNameVisibleToFriendly( false )
decoy.SetNameVisibleToEnemy( false )
decoy.SetFlickerRate( 1.0 )
decoy.SetDecoyRandomPulseRateMax( 0.5 ) //pulse amount per second
decoy.SetFadeDistance( DECOY_FADE_DISTANCE )
decoy.SetNoTarget( true )
decoy.SetNoTargetSmartAmmo( true )


	Highlight_SetFriendlyHighlight( decoy, "friendly_player_decoy" )
	Highlight_SetOwnedHighlight( decoy, "friendly_player_decoy" )
	decoy.e.hasDefaultEnemyHighlight = player.e.hasDefaultEnemyHighlight
	SetDefaultMPEnemyHighlight( decoy )

	Assert ( IsNewThread(), "Must be threaded off." )


    entity holoPilotTrailFXFriendly = StartParticleEffectOnEntity_ReturnEntity( decoy, SPLIT_TIMELINES_TRAIL_FX_FRIENDLY, FX_PATTACH_POINT_FOLLOW, attachID )


from _internal.nut 
GetPlayerStatArrayInt()



entity.GetParent()
entity.SetParent()

	entity camera = CreateEntity( "point_viewcontrol" )
	camera.kv.spawnflags = 56 // infinite hold time, snap to goal angles, make player non-solid

	camera.SetOrigin( data.cameraOrigin )
	camera.SetAngles( data.cameraAngles )

    				player.SetPredictionEnabled( true )
				player.ClearViewEntity()


                TakeWeaponNow()


point_viewcontrol = point camera entity

	entity flagTrailFX = StartParticleEffectOnEntity_ReturnEntity( decoyChildEnt, GetParticleSystemIndex( DECOY_FX ), FX_PATTACH_POINT_FOLLOW, decoyChildEnt.LookupAttachment( "fx_end" ) )
	flagTrailFX.kv.VisibilityFlags = ENTITY_VISIBLE_TO_ENEMY





takeweaponsbytype
giveweaponsbytype?


player.p

