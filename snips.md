```
r.db('lbpd').table('incidents').getNearest(r.point(-118.16418829999999,33.7718214), {index: 'location'}).limit(1)
```

```
var geoSuccess = function(position) {
    console.log(position)
}

navigator.geolocation.getCurrentPosition(geoSuccess);

```