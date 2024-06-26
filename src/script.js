'use strict';

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;

    constructor(coords, distance, duration) {
        // this.date = ...
        // this.id = ...
        this.coords = coords; // [lat, lng]
        this.distance = distance; // in km
        this.duration = duration; // in min
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]
            } ${this.date.getDate()}`;
    }

    click() {
        this.clicks++;
    }
}

class Running extends Workout {
    type = 'running';

    constructor(coords, distance, duration, cadence, id=null) {
        super(coords, distance, duration);
        this.cadence = cadence;
        if(id != null)
        {
            this.id = id;
        }
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain,id = null) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        // this.type = 'cycling';
        if(id != null)
        {
            this.id = id;
        }
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}



///////////////////////////////////////
// APPLICATION ARCHITECTURE

const sortWorkout = document.querySelector('.handle-workout--sort__input');
const typeSort = document.querySelector('.handle-workout--type__input');
const deleteBtn = document.querySelector('.delete-all')
const form = document.querySelector('.form');
const formHeader = form.firstElementChild;
const formTitle = document.querySelector('.form__title')
const inputs = document.querySelectorAll('input');
const formCloseButton = document.querySelector('.form__btn-close')
const containerWorkouts = document.querySelector('.workouts');
const workoutList = document.querySelector('.workout--list');
const noWorkout = document.querySelector('.workout__error');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const modal = document.querySelector('.modal');
const errorContent = document.querySelector('.error-content');
const closeModal = document.querySelector('.btn--close-modal');
const overlay = document.querySelector('.overlay');
const tempImg = document.querySelector(".tempImg");
const tempSpin = document.querySelector('.tempSpin')
const map = document.getElementById('map')



// to get the bundeled image reference after build to show the images
const srcOptionIcon = tempImg.src;
const srcSpinner = tempSpin.src;
tempImg.remove();
tempSpin.remove();

//edit form 

const editForm = document.querySelector('.edit-form');
const editInputType = document.querySelector('.edit-form__input--type');
const editInputDistance = document.querySelector('.edit-form__input--distance');
const editInputDuration = document.querySelector('.edit-form__input--duration');
const editInputCadence = document.querySelector('.edit-form__input--cadence');
const editInputElevation = document.querySelector('.edit-form__input--elevation');

///
let workoutEdit;
let workoutDelete;
let editWorkoutCancelBtn;
let editWorkoutSubmitBtn;
let selectedWorkout;
let selectedID;
let html;
let reRender = false;
let formIsOpen = false;
///////////////////////////

const spinnerMarkup = `
<div class="spinner">
<img src="${srcSpinner}" alt="">
</div>`

const noWorkoutContent = `
<p class="workout-error-message">
No Workout Found 🏃‍♂️. Try To Add a Workout By Clicking On The Map     
</p>`

const locationErrorContent = `
<h3>🚫LOCATION ACCESS DENIED🚫</h3>
<br>
<h4>Need Location Access For Working Of Application</h4>`;


const inputErrorContent = `
<h3>⚠️INPUT ERROR!⚠️</h3>
<br>
<h4>Given Input Is Not Readable Try To Input Only Numbers And Positive Aspect The Elevation</h4>`;
const formErrorContent = `
<h3>⛔CONCURRENT ACCESS⛔</h3>
<br>
<h4>Complete The Current Process Before Proceeding To The Next One</h4>`;

let modalHTML;
function sortW(arr, order, type) {
    arr.sort(function (a, b) {
        const idA = Number(a.id);
        const idB = Number(b.id);
        if (order === "asc" && type === "date") return idA - idB;
        if (order === "dec" && type === "date") return idB - idA;
        if (order === "asc" && type === "distance") return a.distance - b.distance;
        if (order === "dec" && type === "distance") return b.distance - a.distance;
    })
}
class App {
    #map;
    #mapZoomLevel = 15;
    #mapEvent;
    #workouts = [];
    #workoutMarker = [];
    #tempLat = null;
    #tempLang = null ;
    #tempID;
    constructor() {
        // Get user's position
        this._workoutErrorRenderer = this._workoutErrorRenderer.bind(this);
        this._sortWorkoutType = this._sortWorkoutType.bind(this);
        this._closeForm = this._closeForm.bind(this);
        this._getPosition();
        // Get data from local storage
        this._getLocalStorage();

        this._workoutErrorRenderer();
        // Attach event handlers
        formCloseButton.addEventListener('click',this._closeForm)
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
        closeModal.addEventListener('click', this._closeModal);
        sortWorkout.addEventListener('change', this._sortBy.bind(this));
        typeSort.addEventListener('change', this._sortWorkoutType);
        deleteBtn.addEventListener('click', this._deleteAllWorkout.bind(this));
    }
    _refreshValue()
    {
        [selectedWorkout,selectedID,this.#tempLat,this.#tempLang] = '';
        reRender = false;
    }
    _getPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this), this._openModal
            );
    }
//     _loadMap(position) {
//         const { latitude } = position.coords;
//         const { longitude } = position.coords;
//         const coords = [latitude, longitude];
        
//         map.insertAdjacentHTML('afterbegin',spinnerMarkup);
//         const spinner = document.querySelector('.spinner'); 
//         this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    
//         // Define the tile layer for the first layer
// const firstLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// });

// // Add the first layer to the map
// firstLayer.addTo(this.#map);

// // Listen for tile load events
// firstLayer.on('load', () => {
//     // Hide spinner once tiles have loaded
//     spinner.remove();
// });

// // Define the tile layer for the satellite view
// const satelliteLayer = L.tileLayer(
//     'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
//     {
//         attribution: '© Stadia Maps'
//     }
// );

// // Define the tile layer for the dark view
// const darkLayer = L.tileLayer(
//     'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
//     {
//         attribution: '© Stadia Maps'
//     }
// );

// // Construct the baseTree with all tile layers
// const baseTree = [
//     {
//         label: 'Select Map',
//         children: [
//             { label: 'Default', layer: firstLayer },
//             { label: 'Satellite', layer: satelliteLayer },
//             { label: 'Dark', layer: darkLayer }
//         ]
//     }
// ];

// // Add a layer control with the baseTree to the map
// L.control.layers.tree(baseTree).addTo(this.#map);

    

//         this.#map.on('click', (e) => {
//             if (!formIsOpen) {
//                 return this._showForm(e);
//             } else {
//                 this._closeForm();
//                 return this._openModal('form');
//             }
//         });
//         this.#workouts.forEach(work => {
//             this._createWorkoutMarker(work);
//         })
//     }
    

_loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    
    // Define the tile layer for the first layer
    const firstLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    map.insertAdjacentHTML('afterbegin', spinnerMarkup);
    const spinner = document.querySelector('.spinner');
    // Add the first layer to the map
    firstLayer.addTo(this.#map);
    
    // Listen for tile load events
    firstLayer.on('load', () => {
            // Hide spinner once tiles have loaded
            spinner.remove();
        });
        
        // Define the tile layer for the satellite view
        const satelliteLayer = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: '© Stadia Maps'
            }
        );
        
        // Define the tile layer for the dark view
        const googleLayer = L.tileLayer(
            'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
,
            {
                attribution: '© Google Maps'
            }
        );
        const worldStreetLayer = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: '© Esri World Street Map'
            }
            )
        // Construct the baseTree with all tile layers
        const baseTree = [
            {
                label: 'Select View',
                children: [
                    { label: 'Default', layer: firstLayer },
                    { label: 'Satellite', layer: satelliteLayer },
                    { label: 'Google Map', layer: googleLayer },
                    { label: 'Street', layer: worldStreetLayer }
                ]
            }
        ];
        
    // Add a layer control with the baseTree to the map
    L.control.layers.tree(baseTree).addTo(this.#map);

    // Event listener for base layer change
    this.#map.on('baselayerchange', (e) => {
        const spinner1 = document.querySelector('.spinner');
        if(!spinner1) map.insertAdjacentHTML('afterbegin',spinnerMarkup);
        e.layer.once('load', () => {
            spinner1?.remove();
        });
    });

    this.#map.on('click', (e) => {
        if (!formIsOpen) {
            return this._showForm(e);
        } else {
            this._closeForm();
            return this._openModal('form');
        }
    });
    this.#workouts.forEach(work => {
        this._createWorkoutMarker(work);
    })
}



    _openModal(modalV) {
        modalHTML = locationErrorContent;
        if (modalV === "input") modalHTML = inputErrorContent;
        if (modalV === "form") modalHTML = formErrorContent;
        inputs.forEach(input => input.blur());
        errorContent.insertAdjacentHTML('beforeend', modalHTML);
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    };
    _closeModal() {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
        errorContent.innerHTML = "";
        inputDistance.focus()
    };
    _sortBy() {
        const sortValue = sortWorkout.value;
        workoutList.innerHTML = "";
        if (sortValue === "recently-added") {
            sortW(this.#workouts, 'asc', 'date') // instead of 'dsc' its sorted in 'asc' order
            this.#workouts.forEach(wor => { this._renderWorkout(wor) })
            this._sortWorkoutType();
        }
        if (sortValue === 'oldest-first') // likewise
        {
            sortW(this.#workouts, 'dec', 'date')
            this.#workouts.forEach(wor => { this._renderWorkout(wor) })
            this._sortWorkoutType();
        }
        if (sortValue === 'longest-first') // likewise
        {
            sortW(this.#workouts, 'asc', 'distance')
            this.#workouts.forEach(wor => { this._renderWorkout(wor) })
            this._sortWorkoutType();
        }
        if (sortValue === 'shortest-first') // likewise
        {
            sortW(this.#workouts, 'dec', 'distance')
            this.#workouts.forEach(wor => { this._renderWorkout(wor) })
            this._sortWorkoutType();
        }
    }

    _sortWorkoutType() {
        const cycling = document.querySelectorAll('.workout--cycling');
        const running = document.querySelectorAll('.workout--running');
        const all = [...running,...cycling];
        const sort = typeSort.value;

        if (sort === "running") {
            noWorkout.innerHTML = '';
            this._workoutErrorRenderer(running);
            cycling.forEach(wor => wor.classList.add('hidden'))
            running.forEach(wor => wor.classList.remove('hidden'))
        }
        if (sort === "cycling") {
            noWorkout.innerHTML = '';
            this._workoutErrorRenderer(cycling);
            running.forEach(wor => wor.classList.add('hidden'))
            cycling.forEach(wor => wor.classList.remove('hidden'))
        }
        if (sort === "all") {
            noWorkout.innerHTML = '';
            this._workoutErrorRenderer(all);
            cycling.forEach(wor => wor.classList.remove('hidden'));
            running.forEach(wor => wor.classList.remove('hidden'));
        }

    }
    _showForm(mapE,title) {
        this.#mapEvent = mapE;
        formIsOpen = true;
        if(title == null) 
        {
            formTitle.innerHTML = "Add New Workout 🏃‍♂️";
            formHeader.style.borderBottom = "2px solid #00c46a"
        }
        if(title == "edit") 
        {
            formTitle.innerHTML = 'Edit Workout ? 🧍‍♂️';
            formHeader.style.borderBottom ="2px solid red"
        }
        form.classList.remove('hidden');
        noWorkout.classList.add('hidden');
        inputDistance.focus();
    }

    _closeForm()
    {
        formIsOpen = false;
        reRender = false ;
        form.style.display = 'none';
        formTitle.innerHTML="";
        form.classList.add('hidden');
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
            '';
        if(selectedWorkout) {selectedWorkout.classList.remove('hidden');}
        setTimeout(() => (form.style.display = 'grid'), 1000);
        noWorkout.innerHTML = '';
        this._workoutErrorRenderer();
    }
    _hideForm() {
        // Empty inputs
        this._closeForm();
        
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        const validInputs = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        e.preventDefault();

        // Get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        let lat , lang ;
        if(!reRender) 
        {  
            [lat,lang ]= [this.#mapEvent.latlng.lat,this.#mapEvent.latlng.lng];
            this.#tempID = null;
        };
        if(reRender) 
        { 
            [lat,lang] = [this.#tempLat,this.#tempLang]; 
        }
        let workout;

        // If workout running, create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;

            // Check if data is valid
            if (
                // !Number.isFinite(distance) ||
                // !Number.isFinite(duration) ||
                // !Number.isFinite(cadence)
                !validInputs(distance, duration, cadence) ||
                !allPositive(distance, duration, cadence)
            )
                return this._openModal('input')

            workout = new Running([lat, lang], distance, duration, cadence , this.#tempID);
        }

        // If workout cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;

            if (
                !validInputs(distance, duration, elevation) ||
                !allPositive(distance, duration)
            )
                return this._openModal("input");

            workout = new Cycling([lat, lang], distance, duration, elevation ,this.#tempID);
        }

        
        // Render workout on map as marker
        this._createWorkoutMarker(workout);

        this._workoutMarkup(workout);
        // Render workout on list
        this._renderWorkout(workout);
        
        // Add new object to workout array
        this.#workouts.push(workout);


        this._workoutErrorRenderer();
        // Hide form + clear input fields
        this._hideForm();
        
        // Set local storage to all workouts
        this._setLocalStorage();
        this._refreshValue();
    }
   
    _createWorkoutMarker(workout) {
        const marker = L.marker(workout.coords)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(
                `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
            );
    
        // Push the marker into the array
        this.#workoutMarker.push(marker);
        this._renderMarkers();
    }
    
    _renderMarkers() {
        this.#workoutMarker.forEach(marker => marker.addTo(this.#map).openPopup());
    }
    
    _workoutErrorRenderer(arr)
    {
        let temp ;
        if (arr && arr.length >= 0)  temp = [...arr];
        if(this.#workouts.length == 0 || temp?.length === 0 )
        {
            noWorkout.insertAdjacentHTML('afterbegin',noWorkoutContent)
            noWorkout.classList.remove('hidden');   
        }
        else{
            noWorkout.classList.add('hidden');
            noWorkout.innerHTML = "";
            }
        return this;
    }

    _workoutMarkup(workout)
    {
        html = `
        <li class="workout workout--${workout.type} work" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}
              <div class="btn-group dropend">
                  <button class="btn btn-secondary " type="button" data-bs-toggle="dropdown"
                      aria-expanded="false">
                      <img class="edit-icon" src="${srcOptionIcon}" alt="">
                  </button>
                  <ul class="dropdown-menu">
                      <li><a class="dropdown-item edit-workout" data-id="${workout.id}"href="#">Edit<i class="fa-solid fa-pencil" style="color: #f7f7f7;"></i></a></li>
                      <li><a class="dropdown-item delete-workout" data-id="${workout.id}"href="#">Delete<i class="fa-solid fa-trash" style="color: #ffffff;"></i></a></li>
                  </ul>
              </div>
          </h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
                  }</span>
            <span class="workout__value" >${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
      `;
      
              if (workout.type === 'running')
                  html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value cadence">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;
      
              if (workout.type === 'cycling')
                  html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value elevation ">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;
    }

    _renderWorkout(workout) {
        this._workoutMarkup(workout);
        if(!reRender)workoutList.insertAdjacentHTML('afterbegin', html);
        if(reRender) 
        {   
            
            this.#workouts.forEach((workout,i) =>
            {
                if(selectedID === workout.id)
                {
                    this.#workouts.splice(i,1);
                    this.#workoutMarker[i].remove();
                    this.#workoutMarker.splice(i,1);
                    this._setLocalStorage();
                }
            })
            selectedWorkout.insertAdjacentHTML('afterend', html);
            selectedWorkout.remove();
        }
        workoutEdit = document.querySelectorAll('.edit-workout');
        workoutDelete = document.querySelectorAll('.delete-workout');
        this._addClickEvent(workoutEdit,'edit');
        this._addClickEvent(workoutDelete);
    }
    _addClickEvent(element,applyChange = 'delete') { 
        element.forEach(el => {
            if (!el.classList.contains('added')) {
                el.addEventListener('click', applyChange === 'edit' ? this._TriggerEditWorkout.bind(this) : this._deleteWorkout.bind(this));
                el.classList.add('added');
            }
        });
    }
    _selectWorkout(e)
    {
        selectedWorkout = e.target.closest('.workout');
    }
    _TriggerEditWorkout(e) {

        if(formIsOpen) return this._openModal('form')

        this._selectWorkout(e);
        selectedWorkout.classList.add('hidden');
        this._showForm(undefined,"edit");
        reRender = true;
        selectedID = selectedWorkout.dataset.id;
        this.#workouts.forEach((workout)=>
            {
                if(selectedID === workout.id)
                {
                    [this.#tempLat,this.#tempLang] = workout.coords;
                    this.#tempID = workout.id;
                }
            })
    }
    _deleteWorkout(e)
    {
        if(formIsOpen) return this._openModal('form')
        this._selectWorkout(e);
        selectedWorkout.remove();
        selectedID = selectedWorkout.dataset.id;
        this.#workouts.forEach((workout,i)=>
            {
                if(selectedID === workout.id)
                {
                    this.#workouts.splice(i,1);
                    this.#workoutMarker[i].remove();
                    this.#workoutMarker.splice(i,1);
                    this._setLocalStorage();
                }
            })
        this._workoutErrorRenderer();
    }
    _moveToPopup(e) {
        // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
        if (!this.#map) return;
        const workoutEl = e.target.closest('.workout');

        if (!workoutEl) return;

        const workout = this.#workouts.find(
            work => work.id === workoutEl.dataset.id
        );
        
        if(!workout) return; // to prevent the error when the user clicks the delete option to delete the workout

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
        // using the public interface
        // workout.click();
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));

        if (!data || data == "") return ;
        this.#workouts = data;
        sortW(this.#workouts, 'asc', 'date');
        this.#workouts.forEach(work => {
            this._renderWorkout(work);
            this._renderMarkers();
        });
    }

    _deleteAllWorkout() {
        const allWorkouts = document.querySelectorAll('.workout');
        allWorkouts.forEach(workout => workout.remove());
        this.#workoutMarker.forEach(marker => marker.remove());
        this.#workoutMarker = [];
        this.#workouts = [];
        this._setLocalStorage();

    }
}

const app = new App();

console.log()