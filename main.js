const exerciseList = document.querySelector('#exercise-list');
const exercises = document.querySelectorAll('.exercise');
const exerciseName = document.querySelector('#exercise-name');

const addMenu = document.querySelector('#add-menu');
const addButton = document.querySelector('#add-set-button');
const backButton = document.querySelector('#back-button');
const saveButton = document.querySelector('#save');
const pastSetsContainer = document.querySelector("#past-sets");

const weightInput = document.querySelector(".weightInput");
const repsInput = document.querySelector(".repsInput");
const restInput = document.querySelector(".restInput");

const currentSetsContainer = document.querySelector('#current-sets');

const createCurrentSet = (currentSetsArray) => {
    if (currentSetsArray.target.currentArray.length === 0) {
        const date = new Date();
        const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const dateAndId = {
            date: dateString,
            id: `${date.getHours()}${date.getMinutes()}${date.getSeconds()}-${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}-${currentSetsArray.target.name}`
        }
        currentSetsArray.target.currentArray.push(dateAndId);
    }
    currentSetsArray.target.currentArray.push({
        'weight': +weightInput.value,
        'reps': +repsInput.value,
        'rest': +restInput.value
    })
    const newSet = document.createElement('div');
    const setWeight = document.createElement('div');
    const setReps = document.createElement('div');
    const setRest = document.createElement('div');
    newSet.className = 'set';
    setWeight.textContent = currentSetsArray.target.currentArray.length === 0 ? '1. ' : `${currentSetsArray.target.currentArray.length - 1}. ` + weightInput.value + 'kg';
    setReps.textContent = repsInput.value + 'reps';
    setRest.textContent = restInput.value === '' ? '0 rest' : restInput.value + 'rest';
    newSet.appendChild(setWeight);
    newSet.appendChild(setReps);
    newSet.appendChild(setRest);
    currentSetsContainer.appendChild(newSet);
    weightInput.value = '';
    repsInput.value = '';
    restInput.value = '';
}

const saveSetToStorage = (event) => {
    const { name, exercise, currentSets } = event.target;
    console.log(name);
    console.log(exercise);
    console.log(currentSets);
    // If exercise from localStorage doesn't exist
    if (!exercise) {
        localStorage.setItem(name, JSON.stringify([currentSets]));
    } else {
        // If exercise exists
        // Fetch exercise
        const exerciseToUpdate = JSON.parse(localStorage.getItem(name));
        // console.log(exerciseToUpdate);
        exerciseToUpdate.unshift(currentSets);
        localStorage.setItem(name, JSON.stringify(exerciseToUpdate));
    }
    renderPastSets(name);
    currentSets.length = 0;
    currentSetsContainer.innerHTML = '';
}

const deleteSetFromStorage = e => {
    const setToDelete = JSON.parse(localStorage.getItem(e.target.name));
    const setId = e.target.id;
    const updatedPastSets = setToDelete.filter(set => set[0].id !== setId);
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
    pastSets.forEach((set, setIndex) => {
        const setToAppend = document.createElement('div');
        setToAppend.className = 'past-set-item';
        set.forEach((setItem, idx) => {
            if (idx === 0) {
                const dateElement = document.createElement('div');
                dateElement.textContent = setItem.date;
                dateElement.className = 'set-date';
                setToAppend.appendChild(dateElement);
            } else {
                const setInformationDiv = document.createElement('div');
                setInformationDiv.className = 'set-information';
                const setWeight = document.createElement('div');
                setWeight.textContent = setItem.weight + 'kg';
                const setReps = document.createElement('div');
                setReps.textContent = setItem.reps + 'reps';
                const setRest = document.createElement('div');
                setRest.textContent = setItem.rest + 'rest';
                const deleteButton = document.createElement('div');
                deleteButton.className = 'delete-set';
                deleteButton.textContent = 'x';
                deleteButton.id = set[0].id;
                deleteButton.addEventListener('click', deleteSetFromStorage);
                deleteButton.name = name;
                setInformationDiv.appendChild(setWeight);
                setInformationDiv.appendChild(setReps);
                setInformationDiv.appendChild(setRest);
                setToAppend.appendChild(setInformationDiv);
                setToAppend.appendChild(deleteButton);
            }
        })
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
    console.log("Setting New Exercise...");
    let currentSets = [];
    console.log("Current sets:" + currentSets);
    exerciseName.textContent = name;
    exerciseList.style.display = 'none';
    addMenu.style.display = 'flex';

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
    addButton.addEventListener('click', createCurrentSet);
    addButton.currentArray = currentSets;
    addButton.name = name;

    backButton.addEventListener('click', resetState);

    saveButton.addEventListener('click', saveSetToStorage);
    saveButton.name = name;
    saveButton.exercise = exercise;
    console.log(exercise);
    saveButton.currentSets = currentSets;
}

exercises.forEach(exercise => {
    exercise.addEventListener('click', (e) => {
        setCurrentExercise(e.target.textContent);
    })
})