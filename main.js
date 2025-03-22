Screen.setFrameCounter(true);
Screen.setVSync(true);

const canvas = Screen.getMode();
canvas.zbuffering = true;
canvas.psmz = Z16S;
Screen.setMode(canvas);

Render.setView(60.0, 5.0, 4000.0);

Camera.type(Camera.LOOKAT);
Camera.position(0.0, 15.0, 45.0);
Camera.target(0.0, 5.0, 0.0);

const spotlight = Lights.new();
Lights.set(spotlight, Lights.AMBIENT, 0.3, 0.3, 0.3); 
Lights.set(spotlight, Lights.DIRECTION, -0.5, -1.0, -0.5); 
Lights.set(spotlight, Lights.DIFFUSE, 50.0, 50.0, 50.0);
Lights.set(spotlight, Lights.SPECULAR, 70.0, 70.0, 70.0); 

const font = new Font("default");
font.scale = 0.5;
font.outline = 1.0;
font.outline_color = Color.new(0, 0, 0); 

const menuimage = new Image("Source/HUD/menu.png");

const garageMesh = new RenderData("source/Map/Garage/garage.obj");
const garageObject = new RenderObject(garageMesh);
garageObject.position = { x: 0.0, y: 0.0, z: 0.0 };
garageMesh.pipeline = 2;
garageMesh.textures.forEach(texture => {
    texture.filter = LINEAR;
});

const carMesh = new RenderData("Source/Car/1/car.obj");
const carObject = new RenderObject(carMesh);
carObject.position = { x: 0.0, y: 0.0, z: 7.0 };
carMesh.pipeline = 2;
carMesh.textures.forEach(texture => {
    texture.filter = LINEAR;
});

const backgroundColor = Color.new(10, 10, 30, 255); 

let rotationAngle = 0.0;
const rotationSpeed = 0.005; 

const menuoption1 = new Image("Source/HUD/menuoption1.png");
const menuoption2 = new Image("Source/HUD/menuoption2.png");

let selectedOption = 0; 

let pad = Pads.get(0); 



while (true) {
    pad.update();
    Screen.clear(backgroundColor);
    Camera.update();

    rotationAngle += rotationSpeed;
    if (rotationAngle >= 360.0) {
        rotationAngle -= 360.0; 
    }
    carObject.rotation = { x: 0.0, y: rotationAngle, z: 0.0 };

    garageObject.render();
    carObject.render();

    menuoption1.color = selectedOption === 0 ? Color.new(255, 10, 255) : Color.new(255, 255, 255);
    menuoption2.color = selectedOption === 1 ? Color.new(255, 10, 255) : Color.new(255, 255, 255);

    menuimage.draw(0, 0);
    menuoption1.draw(457, 191);
    menuoption2.draw(457, 230);



    if (pad.justPressed(Pads.UP)) {
        selectedOption = (selectedOption === 0) ? 1 : 0;
    } else if (pad.justPressed(Pads.DOWN)) {
        selectedOption = (selectedOption === 1) ? 0 : 1;
    } else if (pad.justPressed(Pads.CROSS)) {
 
        if (selectedOption === 0) {
            std.reload("gameplay.js"); 
        } else if (selectedOption === 1) {
            System.exitToBrowser(); 
        }
    }

    Screen.flip();
}
