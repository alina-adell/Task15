let cities = [];
let specializations = [];
let person = [];

Promise.all(
    [
        fetch("cities.json"),
        fetch("specializations.json"),
        fetch("person.json"),
    ]
).then(async ([citiesResponse, specializationsResponse, personResponse]) => {
    const citiesJson = await citiesResponse.json();
    const specializationsJson = await specializationsResponse.json();
    const personJson = await personResponse.json();
    return [citiesJson, specializationsJson, personJson]
})
    .then(response => {
        cities = response[0];
        specializations = response[1];
        person = response[2];


        console.log(filteredAndSorted());
        console.log(findDesigners());
        getInfo.call();
        userAge();

    })

function getInfo() {
    let result = person
        .map(item => {
        let city = cities
            .find(function (cityItem) {
            return cityItem.id === item.personal.locationId;
        });
        if (city && city.name) {
            item.personal.city = city.name;
        }
        delete item.personal.locationId;
        return item;
    });
    result.forEach(item => {
        console.log(`${item.personal.firstName} ${item.personal.lastName}, ${item.personal.city}`);
    });


    let userFigma = person
        .filter(item => {
        const specialization = specializations.find(spec => spec.id === item.personal.specializationId);
        return specialization?.name === 'designer' && item.skills.some(skill => skill.name === 'Figma');
    });

    userFigma.forEach(item => {
        console.log(`${item.personal.firstName} ${item.personal.lastName} is a Figma designer.`);
    });


    let userReact = person
        .find(item => {
        return item.skills.some(skill => skill.name === 'React');
    });

    if (userReact) {
        console.log(`Первый разработчик, владеющий React:`);
        console.log(`Имя: ${userReact.personal.firstName} ${userReact.personal.lastName}`);
    } else {
        console.log('Разработчиков, владеющих React, не найдено.');
    }

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
            return levelB - levelA;
        })[0];

    const bestBackend = person
        .filter(item => item.skills.some(skill => skill.name === "Go"))
        .sort((a, b) => {
            const levelA = a.skills.find(skill => skill.name === "Go").level;
            const levelB = b.skills.find(skill => skill.name === "Go").level;
            return levelB - levelA;
        })[0];

    console.log("Собранная команда для разработки проекта:");
    if (bestDesigner) {
        console.log(`Дизайнер: ${bestDesigner.personal.firstName} ${bestDesigner.personal.lastName}`);
    }
    if (bestFrontend) {
        console.log(`Frontend-разработчик: ${bestFrontend.personal.firstName} ${bestFrontend.personal.lastName}`);
    }
    if (bestBackend) {
        console.log(`Backend-разработчик: ${bestBackend.personal.firstName} ${bestBackend.personal.lastName}`);
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
function filteredAndSorted () {
    let result = person
        .filter(item => {
        const isFullTime = item.request
            .some(r => r.name === "Тип занятости" && r.value === "Полная");
        const city = cities
            .find(cityItem => cityItem.id === item.personal.locationId);
        const specialization = specializations
            .find(spec => spec.id === item.personal.specializationId);
        // console.log("Checking item:", item.personal.firstName, item.personal.lastName);
        // console.log("  Specialization:", specialization?.name === 'backend');
        // console.log("  City:", city?.name === 'Москва') ;
        // console.log("  Is Full Time:", isFullTime);
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







