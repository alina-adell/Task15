let person = [];
let cities = [];
let specializations = [];


Promise.all(
    [
        fetch("person.json"),
        fetch("cities.json"),
        fetch("specializations.json"),

    ]
).then(async ([personResponse, citiesResponse, specializationsResponse]) => {
    const personJson = await personResponse.json();
    const citiesJson = await citiesResponse.json();
    const specializationsJson = await specializationsResponse.json();
    return [personJson, citiesJson, specializationsJson]
})
    .then(response => {
        person = response[0];
        cities = response[1];
        specializations = response[2];


        person.forEach((per) => {
            getInfo.call(per);
        });
        findFigmaDesigner();
        findReactDeveloper();
        userAge();

        const backendEmployees = getBackendEmployeesInMoscow();
        console.log("Backend-разработчики из Москвы, с полной занятостью:");
        console.log(backendEmployees);

        const designers = findDesigners();
        console.log("Дизайнеры, владеющие Photoshop и Figma с уровнем 6+:");
        console.log(designers);

        buildProjectTeam();
    });


function getInfo() {
    let {firstName, lastName, locationId} = this?.personal || {};
    let city = cities.find(cityItem => cityItem.id === locationId);
    if (city && city.name) {
        this.personal.cityName = city.name;
    }
    console.log(`${firstName} ${lastName},  ${this.personal.cityName}`);
}

function findFigmaDesigner() {
    const userFigma = person.filter(item => {
        const specialization = specializations.find(spec => spec.id === item.personal.specializationId);
        return specialization?.name === 'designer' && item.skills.some(skill => skill.name === 'Figma');
    });
    console.log("Дизайнеры, владеющие Figma:");
    userFigma.forEach(designer => {
        getInfo.call(designer);
    });
}

function findReactDeveloper() {
    const userReact = person.find(item =>
        item.skills.some(skill => skill.name === 'React')
    );
    if (userReact) {
        console.log(`Первый разработчик, владеющий React:`);
        getInfo.call(userReact);
    } else {
        console.log('Разработчиков, владеющих React, не найдено.');
    }
}

function userAge() {
    person
        .forEach(item => {
            const today = new Date();
            const birthDate = new Date(item.personal.birthday.split('.').reverse().join('-'));
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
            const finalAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;

            console.log(`${item.personal.firstName} ${item.personal.lastName}: ${finalAge} лет. ${finalAge >= 18 ? 'Старше 18 лет' : 'Моложе 18 лет'}`);
        });
}

function getBackendEmployeesInMoscow() {
    let result = person
        .filter(item => {
            const isFullTime = item.request
                .some(r => r.name === "Тип занятости" && r.value === "Полная");
            const city = cities
                .find(cityItem => cityItem.id === item.personal.locationId);
            const specialization = specializations
                .find(spec => spec.id === item.personal.specializationId);
            return specialization?.name === 'backend' && city?.name === 'Москва' && isFullTime;
        })

    result = result.sort((a, b) => {
        const salaryA = Number(a.request.find(r => r.name === "Зарплата").value);
        const salaryB = Number(b.request.find(r => r.name === "Зарплата").value);
        return salaryA - salaryB;
    });

    return result.map(item => ({
        firstName: item.personal.firstName,
        lastName: item.personal.lastName,
        salary: Number(item.request.find(r => r.name === "Зарплата").value)
    }));
}

function findDesigners() {
    const designers = person
        .filter(item => {
            const isDesigner = item.personal.specializationId === 3;
            const photoshopSkill = item.skills
                .find(skill => skill.name === "Photoshop");
            const figmaSkill = item.skills
                .find(skill => skill.name === "Figma");
            const requiredSkills = photoshopSkill?.level >= 6 && figmaSkill?.level >= 6;
            return isDesigner && requiredSkills;
        });

    return designers.map(item => ({
        firstName: item.personal.firstName,
        lastName: item.personal.lastName,
        skills: item.skills.filter(skill => skill.name === "Photoshop" || skill.name === "Figma")
    }));
}

function buildProjectTeam() {
    const bestDesigner = person
        .filter(item => item.skills.some(skill => skill.name === "Figma"))
        .sort((a, b) => {
            const levelA = a.skills.find(skill => skill.name === "Figma").level;
            const levelB = b.skills.find(skill => skill.name === "Figma").level;
            return levelB - levelA;
        })[0];

    const bestFrontend = person
        .filter(item => item.skills.some(skill => skill.name === "Angular"))
        .sort((a, b) => {
            const levelA = a.skills.find(skill => skill.name === "Angular").level;
            const levelB = b.skills.find(skill => skill.name === "Angular").level;
            return levelB - levelA; // Сортировка по убыванию уровня
        })[0];
    const bestBackend = person
        .filter(item => item.skills.some(skill => skill.name === "Go"))
        .sort((a, b) => {
            const levelA = a.skills.find(skill => skill.name === "Go").level;
            const levelB = b.skills.find(skill => skill.name === "Go").level;
            return levelB - levelA; // Сортировка по убыванию уровня
        })[0];
    console.log("Собранная команда для разработки проекта:");

    if (bestDesigner) {
        console.log(`Дизайнер:`);
        getInfo.call(bestDesigner, "Дизайнер");
    }

    if (bestFrontend) {
        console.log(`\nFrontend-разработчик:`);
        getInfo.call(bestFrontend, "Frontend-разработчик");
    }

    if (bestBackend) {
        console.log(`\nBackend-разработчик:`);
        getInfo.call(bestBackend, "Backend-разработчик");
    }
}










