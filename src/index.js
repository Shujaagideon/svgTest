import * as THREE from 'three'
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

import vertex from './shaders/vertex'
import fragment from './shaders/fragment'
// import ripple from './images/ripple.svg';
import ripple from './images/ripple2.png';
import ripple1 from './images/estate1.jpg'

import * as dat from 'dat.gui'
// import datGuiImage from 'dat.gui.image'
// datGuiImage(dat)
import gsap from 'gsap'

import { TimelineMax } from 'gsap'
import { OrthographicCamera } from 'three'
let OrbitControls = require('three-orbit-controls')(THREE);

// const createInputEvents = require('simple-input-events')
// const event = createInputEvents(window);

export default class Sketch {
    constructor(selector) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor('#fff', 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container = document.getElementById(selector);
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.container.appendChild(this.renderer.domElement);

        // tracked elements

        this.animatedBackground =[...document.querySelectorAll('.cover')];
        this.materials = [];
        this.currentScroll = 0;

        this.camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight,
            0.001,
            1000
        );

        // let frustumSize = 10;
        // let aspect = window.innerWidth / window.innerHeight;
        // this.camera = new THREE.OrthographicCamera(frustumSize* aspect / -2, frustumSize*aspect);
        this.camera.position.set(0, 0, 100);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0;
        this.texture = new THREE.TextureLoader().load(ripple);

        this.paused = false;
        
        this.setupResize();
        this.tabEvents();
        this.addObjects();
        this.resize();
        this.render();
        this.setPosition();
        // this.settings();
    }
    setPosition() {
        this.imageStore.forEach(o => {
            o.mesh.position.y = this.currentScroll - o.top + this.height / 2 - o.height / 2;
            o.mesh.position.x = o.left - this.width / 2 + o.width / 2;
        })
    }
    settings() {
        let that = this;
        this.settings = {
            time: 0,
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, 'time', 0, 100, 0.01);
        this.gui.addImage(this.settings, 'texturePath').onChange((image) => {
            body.append(image);
        });
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

        this.imageAspect = 853 / 1280;
        let a1; let a2;
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect;
            a2 = 1;
        } else {
            a2 = (this.height / this.width) * this.imageAspect;
            a1 = 1;
        }
        this.material.uniforms.resolution.value.x = this.width;
        this.material.uniforms.resolution.value.y = this.height;
        this.material.uniforms.resolution.value.z = a1;
        this.material.uniforms.resolution.value.w = a2;

        const dist = this.camera.position.z;
        this.camera.fov = 2 * Math.atan((this.height / 2) / dist) * (180 / Math.PI);

        // if (this.width / this.height > 1) {
        //     this.plane.scale.x = this.camera.aspect;
        // } else {
        //     this.plane.scale.y = 1 / this.camera.aspect;
        // }

        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: '#extension GL_OES_standard_derivatives : enable'
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                // color: { value: new THREE.Color('#C78F66') },
                color: { value: new THREE.Color('#fcf3a4') },
                texture2: { value: this.texture},
                rg: { value: 0 },
                uDistortionFrequency: { value: 6.5 },
                uDistortionStrength: { value: 0.65 },
                uDisplacementFrequency: { value: 2.120 },
                uDisplacementStrength: { value: 8.152 },
                uTextureSize: { type: "v2", value: new THREE.Vector2(100, 100) },
                uQuadSize: { type: "v2", value: new THREE.Vector2(100, 100) },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });
        this.imageStore = this.animatedBackground.map((img, i) => {
            let bgBlue = false;
            let bgOrange = false;
            let bounds = img.getBoundingClientRect()

            let geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 50, 50);
            let texture = new THREE.Texture(img);
            texture.needsUpdate = true;

            let material = this.material.clone();
            material.uniforms.texture2.value = this.texture;
            material.uniforms.uQuadSize.value = new THREE.Vector2(bounds.width, bounds.height);
            if(img.classList.contains('ripple-blue')){
                material.uniforms.rg.value = 0.8;
                bgBlue = true;
            }
            if (img.classList.contains('ripple-orange')) {
                material.uniforms.rg.value = 0;
                bgOrange = true;
            }
            this.materials.push(material);
            let mesh = new THREE.Mesh(geometry, material);

            this.scene.add(mesh);


            return {
                img: img,
                mesh: mesh,
                bgBlue: bgBlue,
                top: bounds.top,
                left: bounds.left,
                bgOrange: bgOrange,
                width: bounds.width,
                height: bounds.height,
            }
        })
    }

    tabEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop()
            } else {
                this.play();
            }
        });
        document.querySelector('.toggle').addEventListener('click',()=>{
            this.imageStore.forEach(img=>{
                if(img.bgBlue){
                    gsap.to(img.mesh.material.uniforms.rg,{
                        value: 0,
                        duration: 0.6
                    });
                    img.bgBlue = !img.bgBlue;
                }
                else if (img.bgOrange == false && img.bgBlue == false){
                    gsap.to(img.mesh.material.uniforms.rg, {
                        value: 0.8,
                        duration: 0.6
                    });
                    img.bgBlue = !img.bgBlue;
                }
            })
            // console.log(document.querySelector('.cover').classList);
        })
    }
    stop() {
        this.paused = true;
    }

    play() {
        this.paused = false;
    }

    render() {
        if (this.paused) return;
        this.time += 0.05;
        // update the scroll top
        this.currentScroll = window.scrollY;
        this.setPosition();
        // this.material.uniforms.time.value = this.time;
        this.materials.forEach(m => {
            m.uniforms.time.value = this.time;
        })
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}
new Sketch('container');