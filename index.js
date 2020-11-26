const moveToMapPosition = (master, clones, mapAmount) => {
  var center = master.map.getCenter();
  var zoom = master.map.getZoom();
  var bearing = master.map.getBearing();
  var pitch = master.map.getPitch();

  const crazyNumber = 0.0068735958872669735;
  const baseOffset = crazyNumber / mapAmount
  const baseWidth = 1280
  const ratio = baseOffset / baseWidth
  console.log(master)

  const windowWidth =  window !== undefined ? window.innerWidth : false
  const mapOffset = windowWidth * ratio

  const lngCenterCoord = master.name === 'MapA' ? center.lng + (mapOffset * (mapAmount - 1)) : center.lng - (mapOffset * (mapAmount - 1))

  clones.forEach(function (clone) {
    clone.map.jumpTo({
      center: {lng: lngCenterCoord, lat: center.lat},
      zoom: zoom,
      bearing: bearing,
      pitch: pitch
    });
  });
}

// Sync movements of two maps.
//
// All interactions that result in movement end up firing
// a "move" event. The trick here, though, is to
// ensure that movements don't cycle from one map
// to the other and back again, because such a cycle
// - could cause an infinite loop
// - prematurely halts prolonged movements like
//   double-click zooming, box-zooming, and flying
function syncMaps () {
  var maps;
  var argLen = arguments[0].length;
  var mapAmount = arguments[1];

  if (argLen === 1) {
    maps = arguments[0][0];
  } else {
    maps = [];
    for (var i = 0; i < argLen; i++) {
      maps.push(arguments[0][i]);
    }
  }

  // Create all the movement functions, because if they're created every time
  // they wouldn't be the same and couldn't be removed.
  var fns = [];
  maps.forEach(function (map, index) {
    fns[index] = sync.bind(null, map, maps.filter(function (o, i) { return i !== index; }));
  });

  function on () {
    maps.forEach(function (map, index) {
      map.map.on('move', fns[index]);
    });
  }

  function off () {
    maps.forEach(function (map, index) {
      map.map.off('move', fns[index]);
    });
  }

  // When one map moves, we turn off the movement listeners
  // on all the maps, move it, then turn the listeners on again
  function sync (master, clones) {
    console.log(master)
    off();
    moveToMapPosition(master, clones, mapAmount);
    on();
  }

  on();
  return function(){  off(); fns = []; };
}

module.exports = syncMaps;
