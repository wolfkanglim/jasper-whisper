import * as THREE from './js/three.module.js';
import {OrbitControls} from './js/OrbitControls.js';
import {GLTFLoader} from './js/GLTFLoader.js';



const canvas = document.getElementById('canvas1');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const musicToggleBtn = document.getElementById('bgm-toggle');
const musicWaveBtn = document.getElementById('music-wave');

////////// THREE variables /////

let scene, camera, renderer, orbitControls;
let stars;
let longboard;
let cubeMesh;
const carouselCount = 8;
const carousels = [];
const carouselObj = new THREE.Object3D(); 

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
let particleStars;

const spaceRed = textureLoader.load('./assets/textures/bkg3_front5.png');
const spacePink2 = textureLoader.load('./assets/images/space-pink-galaxy2.jpg');
const snowflakeTexture = textureLoader.load('./assets/images/snowflake-4.png');
const imgTextures = [
 textureLoader.load("./assets/photos/stone-1-WA0025.jpg"),
 textureLoader.load("./assets/photos/riu3.jpg"),
 textureLoader.load("./assets/photos/stone-2.jpg"),
 textureLoader.load("./assets/photos/riu1.jpg"),
 textureLoader.load("./assets/photos/stone-3.jpg"),
 textureLoader.load("./assets/photos/riu4.jpg"),
 textureLoader.load("./assets/photos/flower-2.jpg"),
 textureLoader.load("./assets/photos/flower-1.jpg"),
];    

//nav bar //
const trigger = document.querySelector('.trigger');
const nav = document.querySelector('.full-screen-nav');
const backdrop = document.querySelector('.backdrop');

trigger.addEventListener('click', () => nav.classList.add('open-nav'));
backdrop.addEventListener('click', () => nav.classList.remove('open-nav'));

window.onload = function(){
        //functions//
     initThree();
     createLights();
     createParticles();
     createCarousel();
     createLongboard();
     setAudio();
     
     animate();  
}
   

///// init functions /////

///// THREE /////

function initThree(){
     scene = new THREE.Scene();
     //scene.background = new THREE.Color(0x111111);
     scene.background = spacePink2;
     scene.fog = new THREE.Fog(0x111111, 250, 1050);
     camera = new THREE.PerspectiveCamera(
          65,
          window.innerWidth/window.innerHeight,
          1,
          10000
     )
     camera.position.set(0, 0, 100);
     camera.lookAt(0, 0, 0);

     renderer = new THREE.WebGLRenderer({antialias: true, 
     canvas: canvas});
     renderer.setPixelRatio(window.devicePixelRatio);
     renderer.setSize(window.innerWidth, window.innerHeight);
     renderer.shadowMap.enabled = true;

     orbitControls = new OrbitControls(camera, renderer.domElement);
     orbitControls.enableDamping = true;
     orbitControls.dampingFactor = 0.4;  
}

//Audio
function setAudio(){
     const listener = new THREE.AudioListener();
     scene.add(listener);
     const bgm = new THREE.Audio(listener);
     const audioLoader = new THREE.AudioLoader();
   audioLoader.load('./assets/audios/7daysofsummer.mp3', function(buffer){
          bgm.setBuffer(buffer);
          bgm.setLoop(true);
          bgm.setVolume(0.25);
     })

     musicToggleBtn.addEventListener('click', function(){
          musicToggleBtn.style.display = 'none';
          musicWaveBtn.style.display = 'block';
     bgm.play();
     })
     musicWaveBtn.addEventListener('click', function(){
          musicToggleBtn.style.display = 'block';
          musicWaveBtn.style.display = 'none';
     bgm.stop();
     })
};

function createLights(){
     const ambientLight = new THREE.AmbientLight(0xffffff, 0.51);
     scene.add(ambientLight);
     const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
     dirLight.position.set(5, 450, 150);
     scene.add(dirLight);
     dirLight.castShadow = true;
     dirLight.shadow.mapSize.width = 1024;
     dirLight.shadow.mapSize.height = 1024;
     const d = 150;
     dirLight.shadow.camera.top = d;
     dirLight.shadow.camera.right = d;
     dirLight.shadow.camera.bottom = -d;
     dirLight.shadow.camera.left = -d;
     dirLight.shadow.camera.near = 0.1;
     dirLight.shadow.camera.far = 100;

     const pointLight1 = new THREE.PointLight(0xffffff, 0.5);
     pointLight1.position.set(0, 240, 35);
     scene.add(pointLight1);
     const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
     pointLight2.position.set(0, -240, -35);
     scene.add(pointLight2);

     const greenLight = new THREE.PointLight(0x00ff00, 0.5, 1000, 0);
     greenLight.position.set(550, 50, 0);
     scene.add(greenLight);

     const redLight = new THREE.PointLight(0xff0000, 0.5, 1000, 0);
     redLight.position.set(-550, 50, 0);
     scene.add(redLight);

     const blueLight = new THREE.PointLight(0x0000ff, 0.5, 1000, 0);
     greenLight.position.set(0, 50, 550);
     scene.add(blueLight); 
};

// particles //
function createParticles(){
     const amount = 1250;
     const radius = 1000;

     const positions = new Float32Array( amount * 3 );
     const colors = new Float32Array( amount * 3 );
     const sizes = new Float32Array( amount );

     const vertex = new THREE.Vector3();
     const color = new THREE.Color( 0xffffff );

     for ( let i = 0; i < amount; i ++ ) {
          vertex.x = ( Math.random() * 2 - 1 ) * radius;
          vertex.y = ( Math.random() * 2 - 1 ) * radius;
          vertex.z = ( Math.random() * 2 - 1 ) * radius;
          vertex.toArray( positions, i * 3 );

          if ( vertex.x < 0 ) {
          color.setHSL( 0.5 + 0.5 * ( i / amount ), 0.7, 0.5 );
          } else {
          color.setHSL( 0.0 + 0.5 * ( i / amount ), 0.9, 0.5 );
          }
          color.toArray( colors, i * 3 );
          sizes[ i ] = 100;
     }
     
     const geometry = new THREE.BufferGeometry();
     geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
     geometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
     geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

     const material = new THREE.ShaderMaterial( {
          uniforms: {
               color: { value: new THREE.Color( 0xffffff ) },
               pointTexture: { value: new THREE.TextureLoader().load( './assets/images/shining-star.png' ) }
          },
          vertexShader: document.getElementById( 'vertexshader' ).textContent,
          fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true,
          opacity: 0.47
     } );
     
     particleStars = new THREE.Points( geometry, material );
     scene.add( particleStars );  
};

function createCube(texture){
     const geometry = new THREE.BoxGeometry(50, 36, 5);
     const material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
          opacity: 1
     })
     cubeMesh = new THREE.Mesh(geometry, material);
     cubeMesh.castShadow = true;
     cubeMesh.receiveShadow = true;
     scene.add(cubeMesh);
     return cubeMesh;
};

function createCarousel(){
     for(let i = 0; i < carouselCount; i++){
         const carousel = createCube(imgTextures[i]);
         const a = i / carouselCount * Math.PI * 2;
         carousel.position.y = Math.cos(a) * 50;
         carousel.position.z = Math.sin(a) * 50;
         
         carouselObj.add(carousel);
         carouselObj.position.set(35, 80, -60);
         scene.add(carouselObj);

         carousels.push(carousel);
     }
};

///// Add 3D Model Longboard ////////

function createLongboard(){ 
     gltfLoader.load('./assets/models/longboard/scene.gltf', (gltf) => {
          longboard = gltf.scene;
          longboard.traverse( function ( child ) {
               if ( child.isMesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
               }
          } );
   
          longboard.scale.set( 1, 1, 1);
          longboard.position.set( 95, 75, 0);
          longboard.rotation.x = Math.PI / 2;
          longboard.rotation.z = Math.PI;
          scene.add( longboard );
     })
};

///// Animation //////

let startTime = null;
function animate(time){
     if(startTime == null){
          startTime = time;
     }
    
     const totalTime = (time - startTime);
     update(totalTime);
     renderer.render(scene, camera);
     requestAnimationFrame(animate);
};

function update(totalTime){
     //orbitControls.update();
     carouselObj.rotation.x += 0.0025 ;
     
     particleStars.rotation.z = 0.0000125 * totalTime;
     particleStars.rotation.x = 0.0000175 * totalTime;
     particleStars.rotation.y = 0.000015 * totalTime;
};

window.addEventListener('resize', function(){
     const aspect = window.innerWidth/window.innerHeight;
     camera.aspect = aspect;
     camera.updateProjectionMatrix();
     camera.lookAt(0, 0, 0);
     renderer.setSize(window.innerWidth, window.innerHeight);
});

///// Back to top function /////

let topButton = document.getElementById("back-to-top");
let popupBtn = document.getElementById('show-popup');

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 30) {
    topButton.style.display = "block";
    popupBtn.style.display = 'block';
  } else {
    topButton.style.display = "none";
    popupBtn.style.display = 'none';
  }
  const tTop = document.body.getBoundingClientRect().top;
 camera.position.y = tTop * -0.03;
};

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};

topButton.addEventListener('click', topFunction);

///// Contact Email ////////////////
const contact = document.getElementById('contact').addEventListener('click', showPopupForm);

function showPopupForm() {
     document.getElementById("contact-form-container").style.display = "block";
};
   
function hidePopupForm() {
     document.getElementById("contact-form-container").style.display = "none";
}
// popup button function
document.addEventListener("DOMContentLoaded", () => {
     popupBtn.addEventListener('click', () => {
       showPopupForm();
     });
     document.addEventListener('keydown', (event) => {
       if (event.key === 'Escape') hidePopupForm()
     });
});

//validation
document.getElementById("contact-form").addEventListener("submit", (event) => {
     const contactForm = event.target
     if (!validateContactForm(contactForm)) {
       event.preventDefault();
       displayError(contactForm, 'Invalid input')
     }
});

// Function to validate email addresses
function isValidEmail(email) {
     // Define the JS Regex pattern for a valid email address
     const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
     
     // Test the email against the pattern and return the result (true or false)
     return emailRegex.test(email);
};
   
// Function to validate phone numbers
function isValidPhoneNumber(phone) {
     // Define the JS Regex pattern for a valid 10-digit phone number
     const phoneRegex = /^\d{10}$/;
     
     // Test the phone number against the pattern and return the result (true or false)
     return phoneRegex.test(phone);
};

// Function to validate the contact form
function validateContactForm(contactForm) {
     // Get the values entered in the form fields
     const name = contactForm["name"].value;
     const email = contactForm["email"].value;
     const phone = contactForm["phone"].value;
     const message = contactForm["message"].value;
   
     // Check if the required fields (name, email, and message) are empty
     // If any of them are empty, return false to prevent form submission
     if (!name || !email || !message) {
       return false;
     } 
   
     // Check if the email is valid using the isValidEmail function
     // If the phone field is not empty, also check if it is valid using the isValidPhoneNumber function
     // If either the email or the phone number is invalid, return false to prevent form submission
     if (!isValidEmail(email) || (phone && !isValidPhoneNumber(phone))) {
       return false;
     } 
     
   
     // If all the validations pass, return true to allow form submission
     return true;
};

// Function to display an error message on the web page
function displayError(formElement, message) {
     const errorElement = formElement.getElementsByClassName("form-error")[0];
     
     // Set the innerHTML of the error element to the provided error message
     errorElement.innerHTML = message;
     
     // Change the display style of the error element to "block" to make it visible
     errorElement.style.display = "block";
};



////////////////////////
