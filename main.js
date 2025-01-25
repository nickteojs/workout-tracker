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
const resetButton = document.querySelector('#reset-tracker');

// Initialise global states
let currentExercise;
let setGroup;

const completeTracker = JSON.parse(localStorage.getItem('completion'));

const initialiseTracker = () => {
    if (!completeTracker) {
        localStorage.setItem('completion', JSON.stringify([]));
    } else if (completeTracker.length > 0) {
        completeTracker.forEach(exerciseTracked => {
            exercises.forEach(exercise => {
                if (exercise.textContent === exerciseTracked) {
                    exercise.classList.add('complete');
                }
            })
        })
    }
}

const resetTracker = () => {
    localStorage.setItem('completion', JSON.stringify([]));
    exercises.forEach(ex => ex.classList.remove('complete'));
}

initialiseTracker();
resetButton.addEventListener('click', resetTracker);

const updateCompleteTracker = (type) => {
    let completeTracker = JSON.parse(localStorage.getItem('completion'));
    if (type === 'add') {
        if (!completeTracker.includes(currentExercise)) {
            completeTracker.push(currentExercise);
            localStorage.setItem('completion', JSON.stringify(completeTracker));
            exercises.forEach(exercise => {
                if (exercise.textContent === currentExercise) {
                    exercise.classList.add('complete');
                }
            })
        }
    } else if (type === 'remove') {
        const updatedTracker = completeTracker.filter(ex => ex !== currentExercise);
        localStorage.setItem('completion', JSON.stringify(updatedTracker));
        exercises.forEach(exercise => {
            if (exercise.textContent === currentExercise) {
                exercise.classList.remove('complete');
            }
        })
    }
}

// const createChart = (exerciseName) => {
//     // 
// }

// var options = {
//     chart: {
//       type: 'line'
//     },
//     series: [{
//       name: 'sales',
//       data: [30,40,35,50,49,60,70,91,125]
//     }],
//     xaxis: {
//       categories: [1991,1992,1993,1994,1995,1996,1997, 1998,1999]
//     }
// }
  
// var chart = new ApexCharts(document.querySelector("#chart"), options);

// chart.render();

const createSetHeader = () => {
    const setHeader = document.createElement('div');
    const headerChildren = ['Set', 'Kg', 'Reps', 'Rest'];
    setHeader.className = 'set-header';
    headerChildren.forEach(child => {
        const newChild = document.createElement('div');
        newChild.className = `header header-${child}`;
        newChild.textContent = child;
        setHeader.appendChild(newChild);
    })
    return setHeader;
}

const createSetElement = (data, type) => {
    let newSet = document.createElement('div');
    if (type === 'current') {
        newSet.className = 'set-information';
        // 1. Individual sets for current workout
        Object.keys(data).forEach(key => {
            const newDiv = document.createElement('div');
            newDiv.textContent = data[key];
            newSet.appendChild(newDiv);
        })
    } else if (type === 'group') {
        // 2. Entire sets for past workouts
        newSet.className = 'past-set-item';
        const dateElement = document.createElement('div');
        dateElement.textContent = data.date;
        dateElement.className = 'set-date';
        newSet.appendChild(dateElement);

        const setHeader = createSetHeader();
        newSet.appendChild(setHeader);
        // Creating subsets within a set
        data.sets.forEach((subset, idx) => {
            const setElement = createSetElement({
                index: idx + 1,
                weight: subset.weight,
                reps: subset.reps,
                rest: formatRestTime(subset.restMinutes, subset.restSeconds)
            }, 'current');
            newSet.appendChild(setElement);
        })

        const deleteButton = document.createElement('div');
        deleteButton.className = 'delete-set';
        deleteButton.textContent = 'x';
        deleteButton.id = data.id;
        deleteButton.addEventListener('click', deleteSetFromStorage);
        newSet.appendChild(deleteButton);
    }
    return newSet;
}

const formatRestTime = (minutes, seconds) => {
    let finalString;
    if (minutes === 0 && seconds === 0) {
        finalString = '0';
    } else if (minutes !== 0 && seconds === 0) {
        finalString = `${minutes}m`;
    } else if (minutes === 0 && seconds !== 0) {
        finalString = `${seconds}s`;
    } else {
        finalString = `${minutes}m ${seconds}s`
    }
    return finalString;
}

const createCurrentSet = (e) => {
    e.preventDefault();
    const date = new Date();
    // If brand new set, create date and ID for setGroup
    if (Object.keys(setGroup).length === 0) {
        setGroup.id = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}-${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}-${currentExercise}`;
        setGroup.date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        setGroup.sets = [];
        // Append set header
        const setHeader = createSetHeader();
        currentSetsContainer.appendChild(setHeader);
    }
    // Populate sets array within setGroup with current sets 
    setGroup.sets.push({
        'weight': +weightInput.value,
        'reps': +repsInput.value,
        'restMinutes': +restMinutes.value,
        'restSeconds': +restSeconds.value
    });
    // Create new DOM element with set information
    const newSet = createSetElement({
        index: setGroup.sets.length,
        weight: weightInput.value,
        reps: repsInput.value,
        rest: formatRestTime(+restMinutes.value, +restSeconds.value)
    }, 'current');

    // Append new set to the DOM
    currentSetsContainer.appendChild(newSet);
    // Reset input values
    weightInput.value = '';
    repsInput.value = '';
    restMinutes.value = '';
    restSeconds.value = '';
}

const saveSetToStorage = () => {
    // Fetch exercises from localStorage
    const exerciseToUpdate = JSON.parse(localStorage.getItem(currentExercise));
    // If there are no past sets
    if (exerciseToUpdate.length === 0) {
        // Update localStorage with new exercise set
        localStorage.setItem(currentExercise, JSON.stringify([setGroup]));
    } else {
        // Add new exercise set to the front of exercise array
        exerciseToUpdate.unshift(setGroup);
        // Update in localStorage
        localStorage.setItem(currentExercise, JSON.stringify(exerciseToUpdate));
    }
    // Update past sets in DOM
    renderPastSets(currentExercise, setGroup);
    // Reset current exercise set group
    Object.keys(setGroup).forEach(set => delete setGroup[set]);
    // Reset current set DOM element
    currentSetsContainer.innerHTML = '';
    // Update global tracker
    updateCompleteTracker('add');
}

const deleteSetFromStorage = e => {
    // Fetch exercise to delete from
    const exerciseToDeleteFrom = JSON.parse(localStorage.getItem(currentExercise));
    const setId = e.target.id;
    // Get updated array by filtering set we want to remove
    const updatedPastSets = exerciseToDeleteFrom.filter(set => set.id !== setId);
    // Update in localStorage
    localStorage.setItem(currentExercise, JSON.stringify(updatedPastSets));
    // Update client side past sets
    renderPastSets(currentExercise, e.target.parentElement);
    // Update global tracker
    updateCompleteTracker('remove');
}

const renderPastSets = (name, set) => {
    // CLIENT SIDE updates, localStorage udpates are handled in respective functions
    // Check if there are already existing sets rendered
    const pastSetItems = document.querySelector('.past-set-item');
    // If nothing has been rendered
    if (!pastSetItems) {
        // Fetch past exercises
        const pastSets = JSON.parse(localStorage.getItem(name));
        // Render them
        pastSets.forEach(set => {
            const setToAppend = createSetElement(set, 'group');
            pastSetsContainer.append(setToAppend);
        })
    } else {
        // If things have already been rendered, add new to the DOM
        if (Object.keys(set).length) {
            // Create set here
            const newSetGroup = createSetElement(set, 'group');
            let referenceElement = document.querySelector('.past-set-item');
            pastSetsContainer.insertBefore(newSetGroup, referenceElement);
        } else {
            // Remove element from DOM
            set.remove();
        }
    }
}

const resetState = () => {
    addMenu.style.display = 'none';
    exerciseList.style.display = 'flex';
    currentSetsContainer.innerHTML = '';
    pastSetsContainer.innerHTML = '';
}

const setCurrentExercise = (name) => {
    // Update global states
    currentExercise = name;
    setGroup = {};
    // Editing DOM elements to reflect current exercise
    exerciseName.textContent = name;
    exerciseList.style.display = 'none';
    addMenu.style.display = 'flex';
    // Check if exercise history exists in localStorage
    let exercise = localStorage.getItem(name);
    if (!exercise) {
        // If no exercise history, initialise key value pair with empty array
        localStorage.setItem(name, JSON.stringify([]));
        // Refresh exercise value
        exercise = localStorage.getItem(name);
    } else if (JSON.parse(exercise).length > 0) {
        // Render if there's existing sets
        renderPastSets(name);
    }
    
    // Setup event listeners
    exerciseForm.addEventListener('submit', createCurrentSet);
    backButton.addEventListener('click', resetState);
    saveButton.addEventListener('click', saveSetToStorage);
}

exercises.forEach(exercise => {
    exercise.addEventListener('click', (e) => {
        setCurrentExercise(e.target.textContent);
    })
})