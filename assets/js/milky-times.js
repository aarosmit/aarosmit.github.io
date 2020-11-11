body = document.body;

// // create a form for desired coordinates
function createForm () {
  form = document.createElement('form');
  form.style.cssText = 'text-align: center; font-family: monospace;';
	form.method = 'get';
	coordStr = document.createElement('input');
	coordStr.type = 'text';
	coordStr.name = 'coordStr';
	coordStr.placeholder = 'XX.XXX,-YY.YYY';
	form.appendChild(coordStr);
	submit = document.createElement('input');
	submit.type = 'submit';
	submit.value = 'GET DATA';
	form.appendChild(submit);
	body.appendChild(form);
};

// // get coordinates from form/query
function defineVars () {
	let urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get('coordStr') === null) {
		lat = 0;
		long = 0;
	} else {
		coords = urlParams.get('coordStr');
		lat = coords.substring(0, coords.indexOf(',')) * 1;
		long = coords.substring(coords.indexOf(',') + 1, coords.length) * 1;
	};
	corera = 17 + 45 / 60 + 40.04 / 3600;
	coredec = -29 - 0 / 60 - 28.1 / 3600;
	lunarperiod = 29.93;
	months = 36;
	queryTZ = tzlookup(lat, long);
  time = Astronomy.MakeTime(new Date());
	newmoons = [];
  observer = Astronomy.MakeObserver(lat, long, 0);
  milkyAlts = [];
  milkyRiseAzs = [];
  milkySetAzs = [];
	allData = {};
};

function findNewMoons () {
	for (i = 0; i < months; i++) {
		newmoons.push(Astronomy.MakeTime(new Date(Astronomy.SearchMoonPhase(0, time.tt + i * lunarperiod - 7, lunarperiod).date.setHours(0,0,0,0))));
		allData[i] = {
      date: newmoons[i].date,
		};
	};
};

function calcSunData () {
	for (i = 0; i < months; i++) {
		allData[i].sunrise = Astronomy.SearchRiseSet('Sun', observer, +1, newmoons[i], 1);
		allData[i].sunset = Astronomy.SearchRiseSet('Sun', observer, -1, newmoons[i], 1);
	};
};

function calcMilkyData () {
	for (i = 0; i < months; i++) {
		milkyData = [];
    milkyData.push(Astronomy.Horizon(newmoons[i], observer, corera, coredec, 'normal'));
		for (j = 1; j < 25; j++) {
      milkyData.push(Astronomy.Horizon(newmoons[i].tt + j / 24, observer, corera, coredec, 'normal'));
      milkyAlts.push(milkyData[j].altitude);
			if (milkyData[j - 1].altitude / milkyData[j].altitude < 0) {
				if (milkyData[j].altitude > 0) {
          allData[i].milkyRiseAlt = Astronomy.MakeTime((interpolate(milkyData[j - 1].altitude, milkyData[j].altitude) + (j - 1)) / 24 + newmoons[i].tt);
          milkyRiseAzs.push(milkyData[j].azimuth);
				} else if (milkyData[j].altitude < 0) {
          allData[i].milkySetAlt = Astronomy.MakeTime((interpolate(milkyData[j - 1].altitude,milkyData[j].altitude) + (j - 1)) / 24 + newmoons[i].tt);
          milkySetAzs.push(milkyData[j - 1].azimuth);
        };
      };
    };
	};
};

function createStatements () {
  info = document.createElement('p');
  info.style.cssText = 'text-align: center; font-family: monospace; width: 75%; margin-left:auto; margin-right:auto;';
  let sumRiseAz = 0, sumSetAz = 0;
  console.log(Math.max.apply(Math, milkyAlts));
  for (i = 0; i < milkyRiseAzs.length; i++) {
    sumRiseAz += milkyRiseAzs[i];
    sumSetAz += milkySetAzs[i];
  };
  info.innerHTML = `At (${lat},${long}): the milky way rises at an azimuth of ${Math.trunc(sumRiseAz / milkyRiseAzs.length) + String.fromCharCode(176)}, sets at an azimuth of ${Math.trunc(sumSetAz / milkySetAzs.length) + String.fromCharCode(176)}, and rises to a maximum altitude of ${Math.trunc(Math.max.apply(Math, milkyAlts)) + String.fromCharCode(176)}.`
  body.appendChild(info);
  timezone = document.createElement('p');
  timezone.style.cssText = 'text-align: center; font-family: monospace;';
  timezone.innerHTML = `Timezone: ${queryTZ}`;
  body.appendChild(timezone);
};

function createTable () {
  table = document.createElement('table');
  table.style.cssText = 'font-family: monospace; text-align: center; margin-left:auto; margin-right:auto;';
  var th = table.insertRow();
  th.style.cssText = 'font-weight: bold;';
  var th0 = th.insertCell(0);
	var th1 = th.insertCell(1);
	var th2 = th.insertCell(2);
	var th3 = th.insertCell(3);
	var th4 = th.insertCell(4);
	th0.innerHTML = 'date-new-moon';
	th1.innerHTML = 'sun-rise';
	th2.innerHTML = 'sun-set';
	th3.innerHTML = 'milky-rise';
  th4.innerHTML = 'milky-set';
	for (i = 0; i < months; i++) {
    var tr = table.insertRow();
    var td0 = tr.insertCell(0);
    td0.style.cssText = 'text-align: center;';
    var td1 = tr.insertCell(1);
		var td2 = tr.insertCell(2);
		var td3 = tr.insertCell(3);
		var td4 = tr.insertCell(4);
		td0.innerHTML = allData[i].date.toDateString();
		td1.innerHTML = allData[i].sunrise.date.toLocaleTimeString('en-US', {timeZone: queryTZ, hour: '2-digit', minute: '2-digit', hour12: false});
		td2.innerHTML = allData[i].sunset.date.toLocaleTimeString('en-US', {timeZone: queryTZ, hour: '2-digit', minute: '2-digit', hour12: false});
		td3.innerHTML = allData[i].milkyRiseAlt.date.toLocaleTimeString('en-US', {timeZone: queryTZ, hour: '2-digit', minute: '2-digit', hour12: false});
    td4.innerHTML = allData[i].milkySetAlt.date.toLocaleTimeString('en-US', {timeZone: queryTZ, hour: '2-digit', minute: '2-digit', hour12: false});
    if (i % 2 === 0) {
      tr.style.cssText = 'background-color: #e6f5f4';
    };
  };
	body.appendChild(table);
};

function interpolate (first, second) {
	return ((0 - first) / (second - first)) * 1
};

// function decHrToHrMin (dec) {
//   let mins = Math.trunc((dec - Math.trunc(dec)) * 60).toString();
// 	if (mins.length === 1) {
// 		mins = '0' + mins;
// 	};
// 	return Math.trunc(dec) + ':' + mins;
// };

// // functions to run
defineVars();
createForm();
findNewMoons();
calcSunData();
calcMilkyData();
createStatements();
createTable();

console.log(queryTZ);
