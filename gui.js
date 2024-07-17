// console.log("Hello")
const pointcloud = document.getElementById("pointcloud");
// console.log("pt -")
// console.log(pointcloud)
console.log(window.location.search);
var url = new URL(window.location.href);
var PTlink = url.searchParams.get("url");
console.log("Link for redirection:");
console.log(PTlink);
if (PTlink != null) {
  pointcloud.setAttribute("lasloader", { url: PTlink });
}

function changeColoring(value) {
  //unselect current button
  let curval =
    document.getElementById("pointcloud").components.lasloader.data
      .pointcloudColoring;
  curval = curval.replace("'", "").replace("'", "");

  document
    .querySelector("#b" + curval)
    .setAttribute("border-color", "lightgray");

  // change value
  document
    .getElementById("pointcloud")
    .setAttribute("lasloader", "pointcloudColoring", "'" + value + "'");

  //set border color of selected button to gray
  //console.log(value);
  document.querySelector("#b" + value).setAttribute("border-color", "yellow");
}

function changeFrom() {
  let button = document.querySelector("#bFrom");
  let timesince =
    new Date().getTime() - button.getAttribute("time-last-clicked");
  console.log("run from:" + timesince);
  button.setAttribute("time-last-clicked", new Date().getTime());

  // prevents accidental double-running from one click by requiring 0.05 seconds between clicks
  if (timesince > 50) {
    console.log(button.getAttribute("value"));
    //if(button.getAttribute("value")=="0"){

    for (let i = 1; i <= 12; i++) {
      document.querySelector("#b" + i).setAttribute("border-color", "#0000dd");
    }
    document.querySelector("#resetText").setAttribute("value", "X");
    document
      .querySelector("#resetText")
      .setAttribute("position", "0.123 -0.017 0.015");

    button.setAttribute("toggle-state", false);
    button.setAttribute("value", "down");
  }
}

function endChangeFrom(isCalledFromHandleRadio) {
  let button = document.querySelector("#bFrom");
  let timesince =
    new Date().getTime() - button.getAttribute("time-last-clicked");
  console.log("run from:" + timesince);
  button.setAttribute("time-last-clicked", new Date().getTime());

  // prevents accidental double-running from one click by requiring 0.05 seconds between clicks
  if (timesince > 50 || isCalledFromHandleRadio == true) {
    if (document.querySelector("#bFrom").getAttribute("value") == "up") {
      document
        .querySelector("#pointcloud")
        .setAttribute("lasloader", "from", 0);

      // set From button to default style
      document.querySelector("#fromText").setAttribute("value", "All");
      document
        .querySelector("#fromText")
        .setAttribute("position", "0.110 -0.015 0.015");
      document.querySelector("#bFrom").setAttribute("background-color", "#888");
    } else {
      for (let i = 1; i <= 12; i++) {
        document
          .querySelector("#b" + i)
          .setAttribute("border-color", "lightgray");
      }
      let curval =
        document.getElementById("pointcloud").components.lasloader.data
          .classificationValue;
      console.log(curval);
      document
        .querySelector("#b" + curval)
        .setAttribute("border-color", "yellow");

      document.querySelector("#resetText").setAttribute("value", "Reset");
      document
        .querySelector("#resetText")
        .setAttribute("position", "0.112 -0.017 0.015");
      document.querySelector("#bFrom").setAttribute("value", "up");
    }
  }
}

// displays the value of the selected point size below the slider
let ptsize = document.getElementById("pointsizevalue");
// let slider = document.getElementById("point");
// ptsize.innerHTML = slider.value;

/**
 * Change point size
 * x: factor to change size by
 *   size up button calls size(2) which doubles point size
 *   size down button calls size(0.5) which halves point size
 */
function size(x) {
  let value =
    document.getElementById("pointcloud").components.lasloader.data.pointSize;
  // console.log(document.querySelector("#sizeslider").attributes[12].value);
  document
    .getElementById("pointcloud")
    .setAttribute("lasloader", "pointSize", value * x);
}

function handleRadio(data) {
  let button = document.querySelector("#bFrom");
  let timesince =
    new Date().getTime() - button.getAttribute("time-last-clicked");
  console.log("run from:" + timesince);
  button.setAttribute("time-last-clicked", new Date().getTime());

  // prevents accidental double-running from one click by requiring 0.05 seconds between clicks
  if (timesince > 50) {
    console.log(document.querySelector("#bFrom").getAttribute("value"));

    // If selecting "From" category
    if (document.querySelector("#bFrom").getAttribute("value") == "down") {
      // set From button to number and color of selected value
      document.querySelector("#fromText").setAttribute("value", data);
      document
        .querySelector("#fromText")
        .setAttribute("position", "0.12 -0.015 0.015");
      document
        .querySelector("#bFrom")
        .setAttribute(
          "background-color",
          document.querySelector("#b" + data).getAttribute("background-color")
        );

      // change "from" value in pointcloud backend to actually work
      document
        .querySelector("#pointcloud")
        .setAttribute("lasloader", "from", data);

      console.log(
        "from value:" +
          document.querySelector("#pointcloud").components.lasloader.data.from
      );
      endChangeFrom(true);
    } else {
      // If normal classification selection
      //unselect current button
      let curval =
        document.getElementById("pointcloud").components.lasloader.data
          .classificationValue;
      console.log(curval);
      document
        .querySelector("#b" + curval)
        .setAttribute("border-color", "lightgray");
      //document.querySelector("#b"+curval).setAttribute("toggle-state","false")

      //console.log(data.attributes.value.value);
      console.log(document.getElementById("pointcloud").components.lasloader);
      document
        .getElementById("pointcloud")
        .setAttribute("lasloader", "classificationValue", data);
      console.log(document.getElementById("b" + data));
      //set border color of selected button to yellow
      document
        .getElementById("b" + data)
        .setAttribute("border-color", "yellow");
      console.log(
        "classification value:" +
          document.getElementById("pointcloud").components.lasloader.data
            .classificationValue
      );
    }
  }
}

addcolor = function (value) {
  console.log("adding color " + value);
  document.getElementById("c" + value).hidden = false;
  document.getElementById("a" + value).hidden = true;
};

//     url: https://rawhitten.github.io/chunk.laz;
