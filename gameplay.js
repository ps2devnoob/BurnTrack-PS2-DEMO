const pipelines = [
    "NO_LIGHTS",
    "DEFAULT",
    "SPECULAR"
];

const font = new Font("default");
font.scale = 0.6;
font.outline = 1.0;
font.outline_color = Color.new(0, 0, 0);

Screen.setFrameCounter(true);
Screen.setVSync(true);

const canvas = Screen.getMode();
canvas.zbuffering = true;
canvas.psmz = Z16S;
Screen.setMode(canvas);

Render.setView(60.0, 5.0, 4000.0);

const seta = new Image("Source/HUD/seta.png");
const speed = new Image("Source/HUD/speed.png");

let soundtrack = Sound.load("Source/Sound/soundtrack.wav")

const carmesh = new RenderData("Source/car/1/car.obj");
const car_object = new RenderObject(carmesh);
car_object.position = { x: 0.0, y: 0.0, z: 0.0 };
carmesh.pipeline = 2;
carmesh.textures.forEach(texture => {
    texture.filter = LINEAR;
});

const plane_mesh = new RenderData("Source/Map/Track1/track.obj");
const plane_object = new RenderObject(plane_mesh);
plane_object.position = { x: 0.0, y: 0.0, z: 0.0 };
plane_mesh.pipeline = 2;
plane_mesh.textures.forEach(texture => {
    texture.filter = LINEAR;
});

const fence_mesh = new RenderData("Source/Map/Track1/cerca.obj");
const fence_object = new RenderObject(fence_mesh);
fence_object.position = { x: 0.0, y: 0.0, z: 0.0 };
fence_mesh.pipeline = 2;
fence_mesh.getTexture(0).filter = LINEAR;

let playerPosition = { x: 0.0, y: 0.0, z: 0.0 };
let playerRotation = 0.0;
let targetRotation = 0.0; 
let carSpeed = 0.0;
const acceleration = 0.02;
const maxSpeed = 5.0;
const friction = 0.02;
const turnSpeed = 0.024;
const rotationLerpFactor = 0.08;

let carTilt = 0.0;
const maxTilt = 0.1;

let setaAngle = 0.0;
const fullRotation = 4.6;
const rotationSpeed = 0.009;

let cameraYaw = 0.0;
let cameraPitch = 0.33;
let cameraDistance = 45.0;
const PITCH_MIN = 0.05;
const PITCH_MAX = 1.5;

const light = Lights.new();
Lights.set(light, Lights.AMBIENT, 1.0, 0.8, 0.7);
Lights.set(light, Lights.DIRECTION, 0.5, -0.3, 0.7);
Lights.set(light, Lights.DIFFUSE, 50.0, 40.0, 20.0);
Lights.set(light, Lights.SPECULAR, 80.0, 100.0, 60.0);

Camera.type(Camera.LOOKAT);
Camera.position(0.0, 5.0, 35.0);
Camera.rotation(0.0, 0.0, 0.0);

const pad = Pads.get(0);
const cianoClaro = Color.new(255, 220, 180, 255);

Sound.play(soundtrack)

let ee_info = System.getCPUInfo();

let free_mem = `RAM: ${Math.floor(System.getMemoryStats().used / 1048576)}MB / ${Math.floor(ee_info.RAMSize / 1048576)}MB`;
let free_vram = Screen.getFreeVRAM();
let isDrifting = false;
let isDoingSpin = false;


while (true) {
    pad.update();

    Screen.clear(cianoClaro);
    Camera.update();

    let rx = ((pad.rx > 25 || pad.rx < -25) ? pad.rx : 0) / 10240.0;
    let ry = ((pad.ry > 25 || pad.ry < -25) ? pad.ry : 0) / 10240.0;

    cameraYaw += rx * 0.02;
    cameraPitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, cameraPitch - ry * 0.02));

    if (pad.pressed(Pads.CROSS)) {
        carSpeed = Math.min(maxSpeed, carSpeed + acceleration);
        setaAngle = Math.min(fullRotation, setaAngle + rotationSpeed);
    }

    let turnInput = (Math.abs(pad.lx) > 20) ? (-pad.lx / 128.0) : 0.0; 
    targetRotation += turnInput * turnSpeed * 2;
    
    carTilt = Math.max(-maxTilt, Math.min(maxTilt, carTilt + turnInput * 0.01));
    
    if (turnInput === 0) {
        carTilt *= 0.9;
    }

    
    if (!pad.pressed(Pads.CROSS)) {
        if (carSpeed > 0) {
            carSpeed *= (1 - friction);
        }
        setaAngle = Math.max(0, setaAngle - rotationSpeed * 2);
    }
    

    playerRotation += (targetRotation - playerRotation) * rotationLerpFactor;

    let forwardX = Math.sin(playerRotation);
    let forwardZ = Math.cos(playerRotation);

    playerPosition.x += forwardX * carSpeed;
    playerPosition.z += forwardZ * carSpeed;

    const cameraX = playerPosition.x - forwardX * cameraDistance;
    const cameraZ = playerPosition.z - forwardZ * cameraDistance;
    const cameraY = playerPosition.y + Math.sin(cameraPitch) * cameraDistance;

    Camera.position(cameraX, cameraY, cameraZ);
    Camera.target(playerPosition.x, playerPosition.y + 10, playerPosition.z);

    car_object.position = { x: playerPosition.x, y: playerPosition.y, z: playerPosition.z };
    car_object.rotation = { x: 0.0, y: playerRotation, z: carTilt };

    seta.angle = setaAngle;

    car_object.render();
    plane_object.render();
    fence_object.render();

    speed.draw(0, 0);
    seta.draw(500, 301);
    font.print(10, 10, Screen.getFPS(360) + " FPS | " + free_mem + " | Free VRAM: " + free_vram + "KB");

    Screen.flip();
}
