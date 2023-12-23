let t;class e{date=new Date;id=(Date.now()+"").slice(-10);clicks=0;constructor(t,e,o){this.coords=t,this.distance=e,this.duration=o}_setDescription(){this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${["January","February","March","April","May","June","July","August","September","October","November","December"][this.date.getMonth()]} ${this.date.getDate()}`}click(){this.clicks++}}class o extends e{type="running";constructor(t,e,o,s){super(t,e,o),this.cadence=s,this.calcPace(),this._setDescription()}calcPace(){return this.pace=this.duration/this.distance,this.pace}}class s extends e{type="cycling";constructor(t,e,o,s){super(t,e,o),this.elevationGain=s,this.calcSpeed(),this._setDescription()}calcSpeed(){return this.speed=this.distance/(this.duration/60),this.speed}}const i=document.querySelector(".handle-workout--sort__input"),r=document.querySelector(".handle-workout--type__input"),a=document.querySelector(".delete-all"),n=document.querySelector(".form"),c=document.querySelector(".workouts"),u=document.querySelector(".workout--list"),l=document.querySelector(".form__input--type"),d=document.querySelector(".form__input--distance"),p=document.querySelector(".form__input--duration"),h=document.querySelector(".form__input--cadence"),_=document.querySelector(".form__input--elevation"),k=document.querySelector(".modal"),m=document.querySelector(".error-content"),w=document.querySelector(".btn--close-modal"),v=`
<h3>\u{1F6AB}LOCATION ACCESS DENIED\u{1F6AB}</h3>
<br>
<h4>Need Location Access For Working Of Application</h4>`,y=`
<h3>\u{26A0}\u{FE0F}INPUT ERROR!\u{26A0}\u{FE0F}</h3>
<br>
<h4>Given Input Is Not Readable Try To Input Only Numbers And Positive Aspect The Elevation</h4>`;function g(t,e,o){t.sort(function(t,s){let i=Number(t.id),r=Number(s.id);return"asc"===e&&"date"===o?i-r:"dec"===e&&"date"===o?r-i:"asc"===e&&"distance"===o?t.distance-s.distance:"dec"===e&&"distance"===o?s.distance-t.distance:void 0})}new class{#t;#e=13;#o;#s=[];constructor(){this._getPosition(),this._getLocalStorage(),n.addEventListener("submit",this._newWorkout.bind(this)),l.addEventListener("change",this._toggleElevationField),c.addEventListener("click",this._moveToPopup.bind(this)),w.addEventListener("click",this._closeModal),i.addEventListener("change",this._sortBy.bind(this)),r.addEventListener("change",this._sortWorkoutType),a.addEventListener("click",this.reset)}_getPosition(){navigator.geolocation&&navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),this._openModal)}_loadMap(t){let{latitude:e}=t.coords,{longitude:o}=t.coords;this.#t=L.map("map").setView([e,o],this.#e),L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(this.#t),this.#t.on("click",this._showForm.bind(this)),this.#s.forEach(t=>{this._renderWorkoutMarker(t)})}_openModal(e){t=v,"input"===e&&(t=y),m.insertAdjacentHTML("beforeend",t),k.classList.remove("hidden")}_closeModal(){k.classList.add("hidden"),m.innerHTML="",d.focus()}_sortBy(){let t=i.value;u.innerHTML="","recently-added"===t&&(console.log("hi"),g(this.#s,"asc","date"),this.#s.forEach(t=>{this._renderWorkout(t)}),this._sortWorkoutType()),"oldest-first"===t&&(g(this.#s,"dec","date"),this.#s.forEach(t=>{this._renderWorkout(t)}),this._sortWorkoutType()),"longest-first"===t&&(g(this.#s,"asc","distance"),this.#s.forEach(t=>{this._renderWorkout(t)}),this._sortWorkoutType()),"shortest-first"===t&&(g(this.#s,"dec","distance"),this.#s.forEach(t=>{this._renderWorkout(t)}),this._sortWorkoutType())}_sortWorkoutType(){let t=document.querySelectorAll(".workout--cycling"),e=document.querySelectorAll(".workout--running"),o=r.value;"running"===o&&(t.forEach(t=>t.classList.add("hidden")),e.forEach(t=>t.classList.remove("hidden"))),"cycling"===o&&(e.forEach(t=>t.classList.add("hidden")),t.forEach(t=>t.classList.remove("hidden"))),"all"===o&&(t.forEach(t=>t.classList.remove("hidden")),e.forEach(t=>t.classList.remove("hidden")))}_showForm(t){this.#o=t,n.classList.remove("hidden"),d.focus()}_hideForm(){d.value=p.value=h.value=_.value="",n.style.display="none",n.classList.add("hidden"),setTimeout(()=>n.style.display="grid",1e3)}_toggleElevationField(){_.closest(".form__row").classList.toggle("form__row--hidden"),h.closest(".form__row").classList.toggle("form__row--hidden")}_newWorkout(t){let e;let i=(...t)=>t.every(t=>Number.isFinite(t)),r=(...t)=>t.every(t=>t>0);t.preventDefault();let a=l.value,n=+d.value,c=+p.value,{lat:u,lng:k}=this.#o.latlng;if("running"===a){let t=+h.value;if(!i(n,c,t)||!r(n,c,t))return this._openModal("input");e=new o([u,k],n,c,t)}if("cycling"===a){let t=+_.value;if(!i(n,c,t)||!r(n,c))return this._openModal("input");e=new s([u,k],n,c,t)}this.#s.push(e),this._renderWorkoutMarker(e),this._renderWorkout(e),this._hideForm(),this._setLocalStorage()}_renderWorkoutMarker(t){L.marker(t.coords).addTo(this.#t).bindPopup(L.popup({maxWidth:250,minWidth:100,autoClose:!1,closeOnClick:!1,className:`${t.type}-popup`})).setPopupContent(`${"running"===t.type?"\uD83C\uDFC3‍♂️":"\uD83D\uDEB4‍♀️"} ${t.description}`).openPopup()}_renderWorkout(t){let e=`
      <li class="workout workout--${t.type} work" data-id="${t.id}">
        <h2 class="workout__title">${t.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${"running"===t.type?"\uD83C\uDFC3‍♂️":"\uD83D\uDEB4‍♀️"}</span>
          <span class="workout__value">${t.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">\u{23F1}</span>
          <span class="workout__value">${t.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;"running"===t.type&&(e+=`
        <div class="workout__details">
          <span class="workout__icon">\u{26A1}\u{FE0F}</span>
          <span class="workout__value">${t.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">\u{1F9B6}\u{1F3FC}</span>
          <span class="workout__value">${t.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `),"cycling"===t.type&&(e+=`
        <div class="workout__details">
          <span class="workout__icon">\u{26A1}\u{FE0F}</span>
          <span class="workout__value">${t.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">\u{26F0}</span>
          <span class="workout__value">${t.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `),u.insertAdjacentHTML("afterbegin",e)}_moveToPopup(t){if(!this.#t)return;let e=t.target.closest(".workout");if(!e)return;let o=this.#s.find(t=>t.id===e.dataset.id);this.#t.setView(o.coords,this.#e,{animate:!0,pan:{duration:1}})}_setLocalStorage(){localStorage.setItem("workouts",JSON.stringify(this.#s))}_getLocalStorage(){let t=JSON.parse(localStorage.getItem("workouts"));t&&(this.#s=t,this.#s.forEach(t=>{this._renderWorkout(t)}))}reset(){localStorage.removeItem("workouts"),location.reload()}};
//# sourceMappingURL=index.b1386ddf.js.map
