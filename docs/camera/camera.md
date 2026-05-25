entity camera = CreateClientSidePointCamera( <4633.86475, 14011.751, -3678.65308>, <0, -85.4728317, 0>, 100 )

	camera.SetMonitorZFar( 100000 )
	camera.SetMonitorExposure( 2 )


    winter express scripts

	entity camera = CreateClientSidePointCamera( origin, angles, fov )

GetLocalClientPlayer().SetMenuCameraEntity( camera )

GetLocalClientPlayer().ClearMenuCameraEntity()
camera.Destroy()
