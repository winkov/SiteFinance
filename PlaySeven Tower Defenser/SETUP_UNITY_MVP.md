# PlaySeven Tower Defenser - Unity MVP Setup

## 1. Install Unity

Yes, you need Unity installed to run and build this project.

Recommended:
- Install Unity Hub.
- Install a Unity LTS version, for example Unity 2022.3 LTS or Unity 2023.2+ if you already use it.
- In Unity Hub, add Android Build Support, Android SDK & NDK Tools, and OpenJDK.

## 2. Create/Open the project

This folder currently contains Unity assets/scripts, but it is not a full Unity project until Unity creates folders like `ProjectSettings`, `Packages`, and `Library`.

In Unity Hub:
1. Click New Project.
2. Choose 3D Core.
3. Set the location to this folder: `PlaySeven Tower Defenser`.
4. Open the project.

If Unity asks to use the existing `Assets` folder, keep it.

## 3. Create the scene

Create a new scene called `MainScene`.

Add these empty GameObjects:
- `GameManager` with `GameManager`, `WaveManager`, `BuildManager`, and `BonusSystem`.
- `WaypointPath` with `WaypointPath`.
- `SpawnPoint`.
- `Castle`.

Inside `WaypointPath`, create child objects named `Waypoint_0`, `Waypoint_1`, `Waypoint_2`, etc. Place them on the enemy route. The first waypoint should be near the spawn point. The last waypoint should be near the castle.

## 4. Create simple prefabs

Enemy prefab:
- Create a Capsule.
- Add a Collider if it does not already have one.
- Add the `Enemy` script.
- Drag it into `Assets/Prefabs` to make a prefab.

Tower prefab:
- Create a Cylinder or Cube.
- Add a Collider.
- Add the `Tower` script.
- Assign the Projectile prefab to `projectilePrefab`.
- Drag it into `Assets/Prefabs`.

Projectile prefab:
- Create a small Sphere.
- Add the `Projectile` script.
- Drag it into `Assets/Prefabs`.

Build spots:
- Create flat Cylinders or Cubes where towers can be built.
- Add Colliders.
- Add the `BuildSpot` script.
- Assign the Tower prefab to `towerPrefab`.

## 5. Wire Inspector references

On `WaveManager`:
- Assign `enemyPrefab`.
- Assign `spawnPoint`.

On each `BuildSpot`:
- Assign `towerPrefab`.
- Set `buildCost`.

On each `Tower` prefab:
- Assign `projectilePrefab`.
- Tune `damage`, `range`, `fireRate`, and `upgradeCosts`.

## 6. UI

Create a Canvas with:
- Text: Gold
- Text: Wave
- Text: Castle HP
- Text: Message
- Button: Start Wave
- Button: Build Tower

Add the `UIManager` script to the Canvas and assign all text/button references.

## 7. Test loop

Press Play:
1. Click `Build Tower`.
2. Click a build spot.
3. Click `Start Wave`.
4. Towers should shoot enemies.
5. Killing enemies gives gold.
6. Clicking an existing tower upgrades it if you have enough gold.

## 8. Android build

When the MVP works in Play Mode:
1. Go to File > Build Settings.
2. Select Android.
3. Click Switch Platform.
4. Add `MainScene` to Scenes In Build.
5. Set Player Settings package name, orientation, and minimum API.
6. Build APK or AAB.
