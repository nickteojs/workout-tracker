const exerciseList = document.querySelector('#exercise-list');
const exercises = document.querySelectorAll('.exercise');
const exerciseName = document.querySelector('#exercise-name');

const addMenu = document.querySelector('#add-menu');
const addButton = document.querySelector('#add-set-button');
const backButton = document.querySelector('#back-button');
const saveButton = document.querySelector('#save');
const pastSetsContainer = document.querySelector("#past-sets");

const exerciseForm = document.querySelector('#setInput');
const weightInput = document.querySelector("#weightInput");
const repsInput = document.querySelector("#repsInput");
const restMinutes = document.querySelector("#restMinutes");
const restSeconds = document.querySelector("#restSeconds");

const currentSetsContainer = document.querySelector('#current-sets');

const createChart = (exerciseName) => {
    // 
}

var options = {
    chart: {
      type: 'line'
    },
    series: [{
      name: 'sales',
      data: [30,40,35,50,49,60,70,91,125]
    }],
    xaxis: {
      categories: [1991,1992,1993,1994,1995,1996,1997, 1998,1999]
    }
  }
  
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  
  chart.render();

const formatRestTime = (minutes, seconds) => {
    console.log(minutes, seconds);
    let finalString;
    if (minutes === 0 && seconds === 0) {
        finalString = '0 rest';
    } else if (minutes !== 0 && seconds === 0) {
        finalString = `${minutes}m rest`;
    } else if (minutes === 0 && seconds !== 0) {
        finalString = `${seconds}s rest`;
    } else {
        finalString = `${minutes}m ${seconds}s rest`
    }
    return finalString;
}

const createCurrentSet = (e) => {
    e.preventDefault();
    let setGroup = e.target.setGroup;
    const date = new Date();
    // If brand new set, create date and ID for setGroup
    if (Object.keys(setGroup).length === 0) {
        console.log("Brand new set..")
        setGroup.id = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}-${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}-${e.target.name}`
        setGroup.date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
        setGroup.sets = []
    } 
    setGroup.sets.push({
        'weight': +weightInput.value,
        'reps': +repsInput.value,
        'restMinutes': +restMinutes.value,
        'restSeconds': +restSeconds.value
    });

    // Render current sets
    const newSet = document.createElement('div');
    const setWeight = document.createElement('div');
    const setReps = document.createElement('div');
    const setRest = document.createElement('div');
    newSet.className = 'set';
    setWeight.textContent = `${setGroup.sets.length}. ` + weightInput.value + 'kg';
    setReps.textContent = repsInput.value + ' reps';
    setRest.textContent = formatRestTime(+restMinutes.value, +restSeconds.value);
    newSet.appendChild(setWeight);
    newSet.appendChild(setReps);
    newSet.appendChild(setRest);
    currentSetsContainer.appendChild(newSet);
    weightInput.value = '';
    repsInput.value = '';
    restMinutes.value = '';
    restSeconds.value = '';
}

const saveSetToStorage = (event) => {
    const { name, exercise, setGroup } = event.target;
    console.log(name);
    console.log(exercise);
    console.log(setGroup);
    // If there are no past sets
    if (JSON.parse(exercise).length === 0) {
        localStorage.setItem(name, JSON.stringify([setGroup]));
    } else {
        // Fetch exercise
        const exerciseToUpdate = JSON.parse(localStorage.getItem(name));
        // console.log(exerciseToUpdate);
        exerciseToUpdate.unshift(setGroup);
        localStorage.setItem(name, JSON.stringify(exerciseToUpdate));
    }
    renderPastSets(name);
    Object.keys(setGroup).forEach(set => delete setGroup[set]);
    currentSetsContainer.innerHTML = '';
}

const deleteSetFromStorage = e => {
    const exerciseToDeleteFrom = JSON.parse(localStorage.getItem(e.target.name));
    const setId = e.target.id;
    const updatedPastSets = exerciseToDeleteFrom.filter(set => set.id !== setId);
    if (updatedPastSets.length === 0) {
        localStorage.setItem(e.target.name, JSON.stringify([]));
    } else {
        localStorage.setItem(e.target.name, JSON.stringify(updatedPastSets));
    }
    renderPastSets(e.target.name);
}

const renderPastSets = (name) => {
    pastSetsContainer.innerHTML = '';
    console.log("Past sets found, adding to past sets");
    const pastSets = JSON.parse(localStorage.getItem(name));
    console.log(pastSets)
    pastSets.forEach(set => {
        const setToAppend = document.createElement('div');
        setToAppend.className = 'past-set-item';
        const dateElement = document.createElement('div');
        dateElement.textContent = set.date;
        dateElement.className = 'set-date';
        setToAppend.appendChild(dateElement);
        
        // Creating subsets within a set
        set.sets.forEach(subset => {
            const setInformationDiv = document.createElement('div');
            setInformationDiv.className = 'set-information';
            const setWeight = document.createElement('div');
            setWeight.textContent = subset.weight + 'kg';
            const setReps = document.createElement('div');
            setReps.textContent = subset.reps + ' reps';
            const setRest = document.createElement('div');
            setRest.textContent = formatRestTime(subset.restMinutes, subset.restSeconds);
            setInformationDiv.appendChild(setWeight);
            setInformationDiv.appendChild(setReps);
            setInformationDiv.appendChild(setRest);
            setToAppend.appendChild(setInformationDiv);
        })
        const deleteButton = document.createElement('div');
        deleteButton.className = 'delete-set';
        deleteButton.textContent = 'x';
        deleteButton.id = set.id;
        deleteButton.addEventListener('click', deleteSetFromStorage);
        deleteButton.name = name;
        setToAppend.appendChild(deleteButton);
        console.log("Appending Set: " + setToAppend);
        pastSetsContainer.append(setToAppend);
    })
}

const resetState = () => {
    addMenu.style.display = 'none';
    exerciseList.style.display = 'flex';
    currentSetsContainer.innerHTML = '';
    pastSetsContainer.innerHTML = '';
}

const setCurrentExercise = (name) => {
    exerciseForm.addEventListener('submit', createCurrentSet);
    console.log("Setting New Exercise...");
    exerciseName.textContent = name;
    exerciseList.style.display = 'none';
    addMenu.style.display = 'flex';
    let setGroup = {}
    let exercise = localStorage.getItem(name);
    // Exercise will be null
    if (!exercise || JSON.parse(exercise).length === 0) {
        localStorage.setItem(name, JSON.stringify([]));
        console.log("First time exercising, adding to storage");
        // Refresh exercise here
        exercise = localStorage.getItem(name);
        console.log("Refreshed exercise");
    } else {
        renderPastSets(name);
    }

    // Adds a set
    exerciseForm.name = name;
    exerciseForm.setGroup = setGroup;

    backButton.addEventListener('click', resetState);

    saveButton.addEventListener('click', saveSetToStorage);
    saveButton.name = name;
    saveButton.exercise = exercise;
    saveButton.setGroup = setGroup;
}

exercises.forEach(exercise => {
    exercise.addEventListener('click', (e) => {
        setCurrentExercise(e.target.textContent);
    })
})