# Highlights



SetSurvivalPropHighlight( entity ent, "survival_item_weapon", false )

ent.Highlight_SetParam( HIGHLIGHT_CONTEXT_NEUTRAL, 0 color )
ent.Highlight_SetParam( HIGHLIGHT_CONTEXT_NEUTRAL, 1, fillColor )


DeployableModelHighlight( entity ent )

DeployableModelInvalidHighlight( entity ent )

Highlight_SetNeutralHighlight( entity ent, "sp_interact_object" )
Highlight_SetFriendlyHighlight( entity ent, "sp_interact_object" )
Highlight_SetEnemyHighlight( entity ent, "sp_interact_object" )
Highlight_SetOwnedHighlight( weapon, "sp_loadout_pickup" )
Highlight

SURVIVAL_Loot_SetHighlightForLoot( entity ent, bool )


```
Highlight Type Strings:

sp_interact_object
sp_loadout_pickup
weapon_drop_active
weapon_drop_normal
survival_item_weapon
survival_item_rare
survival_item_epic
survival_item_legendary
survival_item_heirloom
dropship_enemy
dropship_friendly



Highlight_ClearEnemyHighlight( entity ent )
Highlight_ClearFriendlyHighlight( entity ent )
Highlight_ClearNeutralHighlight( entity ent )

Highlight_SetEnemyHighlightWithParam1( entity ent, "enemy_sonar_execution", ent.GetAttachmentOrigin( headShotAttachmentIndex) )

Highlight_SetEnemyHighlightWithParams( entity ent, "enemy_sonar_execution", <startTime, Time(), 0>, ent.GetAttachmentOrigin( headShotAttachmentIndex) )

Highlight_SetSonarExecutionHighlightOrigin( ent, ent.GetAttachmentOrigin( headShotAttachmentIndex), <startTime, Time(), Time() - startTime> )


entity.Highlight_HideInside( 1.0 )
entity.Highlight_ShowInside( 1.0 )
entity.Highlight_HideOutline( 1.0 )
entity.Highlight_ShowOutline( 1.0 )
entity.Highlight_ResetFlags()
entity.Highlight_SetVisibilityType( HIGHLIGHT_VIS_ALWAYS )
entity.Highlight_SetFadeInTime( 0 )
entity.Highlight_StartOn()
entity.EnableEntScopeHighlight()
entity.Highlight_Enable()
entity.Highlight_Disable()


HighlightContext highlight

highlight = RegisterHighlight( "decoy_prop" )
HighlightContext_SetOutline( highlight, HIGHLIGHT_OUTLINE_CUSTOM_COLOR_OBEY_Z )
HighlightContext_SetRadius( highlight, 5 )
HighlightContext_SetParam( highlight, 0, HIGHLIGHT_COLOR_FRIENDLY )
HighlightContext_SetDrawFunc( highlight, eHighlightDrawFunc.LOS_LINE )
HighlightContext_SetADSFade( highlight, false )
HighlightContext_SetFarFadeDistance( highlight, DECOY_FADE_DISTANCE )

