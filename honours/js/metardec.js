
((response) => {
	
// Message type	
	var messageTypeConverter = (decoded, match) => {
			decoded.type = match[0];
		};

// Station type
	var stationConverter = (decoded, match) => {
		decoded.station = match[0];
	};

// Auto true or false
var autoValidator = (decoded, match) => {
	if(match[0]=='AUTO')
	{
		decoded.auto = true;
	}
	else
		decoded.auto= false;
};

// Time 
	var timeConverter = (decoded, match) => {
		decoded.date = '2020-04-'+match[1];
		decoded.time = match[2]+match[3]+" UTC";	
	
	};
	
//Wind type
	var windConverter = (decoded, match) => {
		// Wind Object
		decoded.wind = {
			direction: match[1],
			speed: parseInt(match[2]),
			gust: match[3],
			
		};
	};

// Wind Variation 	
	var windRangeConverter = (decoded, match) => {
		decoded.deviation = {
			from: match[1],
			to: match[2]
		};
	};

// Weather type
var weatherTypeConverter = (decoded, match) => {

	// Matching the weather code with it's type
	if(match=='FG')
	{decoded.weather='Fog'}
	if(match=='RA')
	{decoded.weather='Rain'}
	if(match=='SN')
	{decoded.weather='Snow'}
	if(match=='DZ')
	{decoded.weather='Drizzle'}
	if(match=='BR')
	{decoded.weather='Mist'}
	if(match=='SA')
	{decoded.weather='Sand'}
	
};

// Prevailing visibility type
	var prevailingConverter = (decoded,match) =>{
		decoded.prevailingVisibility = match[0];

	};

// Visibility variation		
	var visibilityConverter = (decoded, match) => {
		 decoded.visible = {
			runway: match[1],
			runway_direction: match[2],
			visibility: parseInt(match[3]),
			unit : match[4]
		};
		
	};

// Temperature and dewpoint
	var temperatureConverter = (decoded, match) => {
		decoded.temperature = parseInt(match[2]);
		decoded.dewpoint = (!!match[3] ? -1 : 1) * parseInt(match[4]);
	};

//Runway visibility 
	var cloudBaseConverter = (decoded, match) => {
		decoded.sky=match[1];
		decoded.Cloudbaselayer = parseInt(match[2])*100;
	
	};
	
	// Regex expressions to match the Metar Codes
	
	var matches = [
		{ regex: /(METAR)/, parser: messageTypeConverter },
		{ regex: /(\d\d)(\d\d)(\d\d)?Z/, parser: timeConverter },
		{ regex: /(AUTO|COR)/g, parser: autoValidator},
		{ regex: /(?!(AUTO|COR))([A-Z]{4})$/ , parser: stationConverter},
		{ regex: /(\d\d\d)(\d\d)(G(\d\d))?((KT))/, parser: windConverter },
		{ regex: /(\d\d\d)V(\d\d\d)/, parser: windRangeConverter }, 
		{ regex: /(^[0-9][A-Z]{2}[0-9]{1})/, parser: prevailingConverter},
		{ regex: /^R(\d\d(L|C|R)?)\/(\d\d\d\d)(FT)/, parser: visibilityConverter},
		{ regex: /^[A-Z]{2}$/, parser: weatherTypeConverter},
		{ regex: /^(M)?(\d\d)\/(M)?(\d\d)$/, parser: temperatureConverter },
		{ regex: /(BKN|SKC)([0-9]{3})$/, parser: cloudBaseConverter}
		
	];
	
	// parseMetarCodes is the function to decode

	response.parseMetarCodes = (message)=> {
		
		// decoded is an object containing all information
		var decoded = {

		};

		var codes = message.split(" "); // codes containing individual codes as a string
		
		for(var i in codes) {
			var eachCode = codes[i];
				
			for(var j = 0; j < matches.length; j++) {
				var eachRegex = matches[j];		
				var match = eachCode.match(eachRegex.regex); // Match code and regex expression
				if(!!match) {
					eachRegex.parser(decoded, match);								
				}
			}
		}	
		return decoded;
	};
})((typeof window === 'undefined') ? module.exports : window);

