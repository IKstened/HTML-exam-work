//define variables
//we simulate what we got back from a DB for open time frames for meetings
let databaseResponse = {
    "2025-02-15" : ["10:00-10:30"],
    "2025-02-18" : ["10:30-11:00","11:00-11:30","13:00-13:30","13:30-14:00"],
    "2025-02-20" : ["10:00-10:30","10:30-11:00","11:00-11:30","13:00-13:30","13:30-14:00"],
    "2025-02-25" : ["10:00-10:30","10:30-11:00","11:00-11:30","13:00-13:30","13:30-14:00"],
    "2025-02-27" : ["10:00-10:30","10:30-11:00","13:00-13:30","13:30-14:00"],
    "2025-03-04" : ["10:00-10:30","10:30-11:00","11:00-11:30","13:00-13:30","13:30-14:00"],
    "2025-03-06" : ["10:00-10:30","10:30-11:00","11:00-11:30","13:00-13:30","13:30-14:00"],

}
let monthSwitch = {
    "Január" : "01",
    "Február" : "02",
    "Március" : "03",
    "Április" : "04",
    "Május" : "05",
    "Június" : "06",
    "Július" : "07",
    "Agusztus" : "07",
    "Szeptember" : "09",
    "Október" : "10",
    "November" : "11",
    "December" : "12",
    "01" : "Január",
    "02" : "Február",
    "03" : "Március",
    "04" : "Április",
    "05" : "Május",
    "06" : "Június",
    "07" : "Július",
    "07" : "Agusztus",
    "09" : "Szeptember",
    "10" : "Október",
    "11" : "November",
    "12" : "December",
}
let currentTwoMonths = []; // 0-jan 1-feb...
let calendarButtonPrevious;
let calendarButtonNext;
let calendarHeadText;
let calendarTimeContainer;
let calendarCells;
//on DOM content load set up the page

document.addEventListener("DOMContentLoaded", () => {

    calendarHeadText = document.querySelector(".calendar-container__header__text");
    calendarButtonPrevious = document.querySelector(".calendar-container__header__button.button-previous");
    calendarButtonNext = document.querySelector(".calendar-container__header__button.button-next");
    calendarCells = document.querySelectorAll(".calendar-container__body__cell");
    calendarTimeContainer = document.querySelector(".calendar-container__times");
    let offcansvasButtons = document.querySelectorAll(".offcanvas-body button.btn");
    //adding event listeners


    calendarButtonNext.addEventListener("click",() => calendarStepper(1));
    calendarButtonPrevious.addEventListener("click",() => calendarStepper(0));

    calendarCells.forEach((cell) => {
        cell.addEventListener("click", (e) =>{
            timePickerFiller(e.target);
            
        });
    });

    offcansvasButtons.forEach((btn) =>{
        btn.addEventListener("click",() => {
            document.querySelector("section.offcanvas").classList.remove("show");
        });
    });

    //set up all else
    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    let nextMonth;

    if(currentMonth + 1 === 12) {
        nextMonth = `${currentYear + 1}-01`;
    } else {
        nextMonth = `${currentYear }-${currentMonth + 1}`;
    }

    currentTwoMonths = [`${currentYear}-${currentMonth}`, nextMonth]
    //console.log(currentTwoMonths);
    calendarStepper(0);
});



//functions

//some that fills the dates in the picker
function calendardateFiller (year, month) {
    let monthDate = new Date(year,month,1);
    let startDay = monthDate.getDay();//sunday is 0
    let calendarStartDate;

    if(startDay == 0) {
        calendarStartDate = new Date(year,month,-5);
    } else if( startDay == 1) {
        calendarStartDate = monthDate;
    } else if(startDay > 1) {
        calendarStartDate = new Date(year, month, -(startDay-2));
    }

    //console.log(calendarStartDate);

    let calendarCells = document.querySelectorAll(".calendar-container__body__cell");
    let databaseResponseKeys = Object.keys(databaseResponse);
    

    calendarCells.forEach((cell,index) =>{
        let newDate = addDays(calendarStartDate,index);
        let day = newDate.getDate();
        cell.querySelector("p").textContent = day;
        let formatedNewDate = `${newDate.getFullYear()}-${("0" + (newDate.getMonth() + 1)).slice(-2)}-${("0" + newDate.getDate()).slice(-2)}`;

        let newDateMonth = newDate.getMonth();

        if(newDateMonth == month) {
            cell.classList.add("thisMonth");
            if(databaseResponseKeys.includes(formatedNewDate)) {
                cell.classList.add("avialableDay");
            } else {
                cell.classList.remove("avialableDay");
            }
        } else {
            cell.classList.remove("thisMonth", "avialableDay");
        }
        cell.classList.remove("d-none");
    });

    let hideLastSeven = document.querySelector(".calendar-container__body__cell.thisMonth:nth-last-child(-n+7)") ? false : true;
    if(hideLastSeven) {
        for(let i = calendarCells.length-1 ; i > calendarCells.length-8 ; i--) {
            calendarCells[i].classList.add("d-none");
        }
    }

}

function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

//function that handles wich button is visible
function calendarStepper (index) {
    
    let curentMonth = currentTwoMonths[index].split("-");
    calendarHeadText.textContent = `${curentMonth[0]}. ${monthSwitch[("0" + (1 + Number(curentMonth[1]))).slice(-2)]}`;
    if(index == 0) { //we pressed previous
        calendarButtonPrevious.setAttribute("disabled", "disabled");
        calendarButtonNext.removeAttribute("disabled");
        calendardateFiller (curentMonth[0], curentMonth[1]);
    } else { //we pressed next
        calendarButtonPrevious.removeAttribute("disabled");
        calendarButtonNext.setAttribute("disabled", "disabled");
        calendardateFiller (curentMonth[0], curentMonth[1]);
    }
    toggleSelectedInGroupe(false);
    let calendarTimes = document.querySelectorAll(".calendar-container__times__ele");
    calendarTimes.forEach((ele) =>{
        ele.remove()

    });
}

//fill in posible times for that day
function timePickerFiller (targetEle) {
    console.log("target ",targetEle);
    let cellDiv = targetEle.tagName === "DIV" ? targetEle : targetEle.parentElement;
    let pEle = cellDiv.querySelector("p");
    
    // first clean the "választható időpontok"
    let calendarTimes = document.querySelectorAll(".calendar-container__times__ele");
    calendarTimes.forEach((ele) =>{
        ele.remove()

    });

    if(cellDiv.classList.contains("avialableDay")) {
        toggleSelectedInGroupe(cellDiv);
        console.log("has avialableDay ",cellDiv)
        let yearAndMonth = calendarHeadText.textContent.split(". ");
        let formatedDate = `${yearAndMonth[0]}-${monthSwitch[yearAndMonth[1]]}-${("0" + pEle.textContent).slice(-2)}`;

        databaseResponse[formatedDate].forEach((timeFrame) => {
            let div = document.createElement("div");
            div.classList.add("calendar-container__times__ele", "border-2", "rounded-2","m-2", "p-1", "bg-secondary", "text-primary", "fw-bold");
            div.textContent = timeFrame;
            div.addEventListener("click",(e) => toggleSelectedInGroupe(e.target,"times"));

            calendarTimeContainer.appendChild(div);
        });
    }

}

function toggleSelectedInGroupe(target, group = false) {
    let groupEles = group ? document.querySelectorAll(".calendar-container__times__ele") : calendarCells ;

    groupEles.forEach((ele) =>{
        ele.classList.remove("selectedDate");
    });
    if(target) {
        target.tagName != "DIV" ? target.parentElement.classList.add("selectedDate") : target.classList.add("selectedDate");
    }
    
}

function answerCollected() {
    document.querySelector("#successfullSubmitAlert").classList.remove("d-none");
    setTimeout(() => {
        try{document.querySelector("#successfullSubmitAlert").classList.add("d-none")}
        catch{}
    }, 10000);
}