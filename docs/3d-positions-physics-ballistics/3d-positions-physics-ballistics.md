




OriginToGround() -> normal vector with a magnitude corresponding to the height from the origin to the ground


Normal unit vector = <0,0,1> (vertical axis only - direction only, magnitude of 1)




vector function FindAnyPerpendicularVector( vector v) -> gets the normal of a vector (vector perpendicular to it, same magnitude as the vector)

what it does:

1) It gets a vector perpendicular to the xy plane 
2) It multiplies it by the magnitude of the argument vector
3) It rotates the result vector by the angles of the argument vector so that the result vector is perpendicular to the argument vector



Length( vector v ) gets the magnitude of a vector 

VectorToAngles()

VectorToString( vector vec )

vector function FlattenNormalizeVec( vector v ) -> does what it says on the tin, returns a 2D vector (z = height = 0) with a length of 1 (normalized, indicates direction)


float function DistanceAlongVector( vector origin, vector lineStart, vector lineForward )


vector function GetClosestPointOnLineSegment( vector a, vector b, vector p ) -> for a segment


vector function GetClosestPointOnLine( vector a, vector b, vector p )

float function GetDistanceFromLineSegment( vector a, vector b, vector p )

float function GetDistanceSqrFromLineSegment( vector a, vector b, vector p )

float function DegToRad( float degrees )
float function RadToDeg( float radians )


float function CalcFOVScale( float baseFOV, float zoomScale )

float x = DotProduct( vector a, vector b ) -> yields a float scalar

vector x = CrossProduct( vector a, vector b )

CrossProduct() yields a vector perpendicular to the plane defined by vectors a and b


TraceResults trace = TraceLineHighDetail( physicsEnt.GetOrigin() + <0, 0, 16>, physicsEnt.GetOrigin() - <0, 0, 16>, [physicsEnt, ent], LOOT_TRACE, LOOT_COLLISION_GROUP )

trace = GetGroundPosition( ent.GetOrigin() + <0, 0, 16>, ent.GetOrigin() - <0, 0, 8>, [ ent, physicsEnt ] )


TraceLine
TraceHull

AnglesToForward()
AnglesToUp()
AnglesToRight()

angles formed with x, y, z axes 



player.EyeAngles()

player.EyePosition()

player.SnapEyeAngles( <x, y, z> )

player.SnapFeetToEyes()

reviver.SnapEyesToFeet()

method for vectors: .Dot() -> returns a float scalar, takes as an argument another vector 

CreateTraceBlockerVolume( endpoint + BREACH_OFFSET, 24.0, false, CONTENTS_BLOCK_PING, player.GetTeam(), PHASE_BREACH_BLOCKER_SCRIPTNAME )

player.GetPlayerOrNPCViewVector()

player.GetViewVector()

Normalize(player.GetViewVector()) for view direction only

entity groundEnt = player.GetGroundEntity()

use IsValid(groundEnt) to check if the player is standing on top of an entity 

deg_sin( float theta )
deg_cos( float theta )
clamp( min, max )

PhaseBreachTraceResults eyeTrace = DoEyeTrace( eyePos, eyeDir, rangeEffective, ignoredEnts, mins, maxs )

TraceResults tr = TraceLine( traceStart, traceEnd , [ player ], TRACE_MASK_SOLID_BRUSHONLY , TRACE_COLLISION_GROUP_PLAYER, player )

VectorRotateAxis( eyeDir, player.GetRightVector(), -1 )

IsNormalVertical( eyeTrace.results.surfaceNormal )

WallToTopResults results = TraceFromWallToTop( eyeTrace.results.endPos, wallToTopNormal, [ player ], LEDGE_CHECK_BACK, checkUpDistance, TRACE_MASK_PLAYERSOLID_BRUSHONLY, TRACE_COLLISION_GROUP_PLAYER, debugDrawTime, true, mins, wallTraceMaxs )


AnglesToForward()
AnglesToUp()
AnglesToRight()

AnglesCompose()

float dist = Distance( playerOrigin, closestPoint )

AnglesInverse()



