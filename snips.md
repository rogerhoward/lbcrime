```
forever -w  --watchDirectory . start server.js
```


```
r.db('lbpd').table('incidents').getNearest(r.point(-118.16418829999999,33.7718214), {index: 'location'}).limit(1)
```

```
var geoSuccess = function(position) {
    console.log(position)
}

navigator.geolocation.getCurrentPosition(geoSuccess);

```




```
<item>
    <id>2375503</id>
    <case_number>160006884</case_number>
    <title>BURGLARY - RESIDENTIAL
    </title>
    <description>
    </description>
    <date_occured>2016-02-01 08:01:00 UTC</date_occured>
    <block_address>1800 Block W COLUMBIA ST</block_address>
    <city>Long Beach</city>
    <state>CA</state>
    <latitude>33.8084915</latitude>
    <longitude>-118.2185964</longitude>
    <incident_id>100</incident_id>
</item>
```