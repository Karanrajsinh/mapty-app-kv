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

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
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

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = 'cycling';
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

///////////////////////////////////////
// APPLICATION ARCHITECTURE

const sortWorkout = document.querySelector('.handle-workout--sort__input');
const typeSort = document.querySelector('.handle-workout--type__input');
const deleteBtn = document.querySelector('.delete-all')
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const workoutList = document.querySelector('.workout--list');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const modal = document.querySelector('.modal');
const errorContent = document.querySelector('.error-content')
const closeModal = document.querySelector('.btn--close-modal');

///////////////////////////

const locationErrorContent = `
<h3>🚫LOCATION ACCESS DENIED🚫</h3>
<br>
<h4>Need Location Access For Working Of Application</h4>`;
const inputErrorContent = `
<h3>⚠️INPUT ERROR!⚠️</h3>
<br>
<h4>Given Input Is Not Readable Try To Input Only Numbers And Positive Aspect The Elevation</h4>`;
let modalHTML;
function sortW(arr,order,type){
  arr.sort(function(a,b)
  {
    const idA = Number(a.id);
    const idB = Number(b.id);
    if(order === "asc"&& type === "date") return idA -idB;
    if(order === "dec" && type === "date") return idB - idA;
    if(order === "asc" && type === "distance") return a.distance - b.distance;
    if(order === "dec" && type === "distance") return b.distance - a.distance;
  })
}
// Function to iterate through each element in a NodeList and apply a callback function
function forEachElement(nodeList, callback) {
  nodeList.forEach(callback);
}

// Function to handle elements without the 'hidden' class
function handleElementWithoutHiddenClass(element) {
  if(!element.classList.contains('hidden')) return ".workout",console.log(element);
}
class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    closeModal.addEventListener('click',this._closeModal)
    sortWorkout.addEventListener('change',this._sortBy.bind(this))
    typeSort.addEventListener('change',this._sortWorkoutType)
    deleteBtn.addEventListener('click',this.reset)
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),this._openModal
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work=>
      {
        this._renderWorkoutMarker(work);
      })
  }
  
  _openModal(modalV) {
    modalHTML = locationErrorContent;
    if(modalV === "input") modalHTML = inputErrorContent;
    errorContent.insertAdjacentHTML('beforeend',modalHTML);
    modal.classList.remove('hidden');
  };
  _closeModal()
  {
    modal.classList.add('hidden');
    errorContent.innerHTML = "";
    inputDistance.focus()
  };
  _sortBy(){
    const sortValue = sortWorkout.value;
    workoutList.innerHTML = "";
    if(sortValue === "recently-added")
    {
      console.log('hi')
      sortW(this.#workouts,'asc','date') // instead of 'dsc' its sorted in 'asc' order
      this.#workouts.forEach(wor => {this._renderWorkout(wor)})
      this._sortWorkoutType();
    }
    if(sortValue === 'oldest-first') // likewise
    {
      sortW(this.#workouts,'dec','date')
      this.#workouts.forEach(wor => {this._renderWorkout(wor)})
      this._sortWorkoutType();
    }
    if(sortValue === 'longest-first') // likewise
    {
      sortW(this.#workouts,'asc','distance')
       this.#workouts.forEach(wor => {this._renderWorkout(wor)})
       this._sortWorkoutType();
    }
    if(sortValue === 'shortest-first') // likewise
    {
      sortW(this.#workouts,'dec','distance')
      this.#workouts.forEach(wor => {this._renderWorkout(wor)})
      this._sortWorkoutType();
    }
  }
  
  _sortWorkoutType(){
    const cycling = document.querySelectorAll('.workout--cycling');
    const running = document.querySelectorAll('.workout--running');
    const sort = typeSort.value;
    
    if(sort === "running")
    {
      cycling.forEach(wor => wor.classList.add('hidden'))
      running.forEach(wor => wor.classList.remove('hidden'))
    }
    if(sort === "cycling")
    {
      running.forEach(wor => wor.classList.add('hidden'))
      cycling.forEach(wor => wor.classList.remove('hidden'))
    }
    if(sort === "all")
    {
      cycling.forEach(wor => wor.classList.remove('hidden'));
      running.forEach(wor => wor.classList.remove('hidden'));
    }
    
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
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
    const { lat, lng } = this.#mapEvent.latlng;
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

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return this._openModal("input");

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage();
  }
_renderWorkoutMarker(workout) {
  L.marker(workout.coords)
  .addTo(this.#map)
    .bindPopup(
      L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick : false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup()
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type} work" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
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
          <span class="workout__value">${workout.cadence}</span>
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
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    workoutList.insertAdjacentHTML('afterbegin', html);
  }

  _moveToPopup(e) {
    // BUGFIX: When we click on a workout before the map has loaded, we get an error. But there is an easy fix:
    if (!this.#map) return;
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

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

    if (!data) return;

    this.#workouts = data;
    
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
