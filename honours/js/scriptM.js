

const d = document,
    fetchBtn = d.querySelector('#fetch-btn'),
    infoBlock = d.querySelector('.information'),
    errorBlock = d.querySelector('.error'),
    codeInput = d.querySelector('#airport-id'),
    metarDecBlock = d.querySelector('.metar-decryption');

const _apiUrls = {
   
    checkwx: 'https://api.checkwx.com'
};
const _apiKeys = {
    yandex: 'trnsl.1.1.20190524T141447Z.0213b37ed61910ce.e7ba9c225b0757bc761e59234afb437f37c8fefb',
    checkwx: 'ce8ff6d2b34d46189f8ce330d4'
  
};

const _dictionary = {
    clouds: {
        SCT: 'scattered',
        SKS: 'clear',
        NSC: 'not significant',
        FEW: 'insignificant, scattered',
        SKT: 'separate scattered',
        BKN: 'significant scattered',
        OVC: 'continuous',
        CB: 'cumulonimbus',
        CAVOK: 'conditions are good'
    },
    // Future work Fill in conditions object
    conditions: {
        VCFG: 'fog in the distance',
        FZFG: 'supercooled fog',
        MIFG: 'ground mist',
        PRFG: 'fog translucent',
        FG: 'fog',
        BR: 'haze',
        HZ: 'haze',
        FU: 'smoke',
        DS: 'dust storm',
        SS: 'sandstorm',
        DRSA: 'sandy snow',
        DRDU: 'dusty snow',
        DU: 'dust in the air (dust haze)',
        DRSN: 'snow drift',
        BLSN: 'blizzard',
        RASN: 'rain with snow',
        SNRA: 'snow with rain',
        SHSN: 'rain shower',
        SHRA: 'rain shower',
        DZ: 'drizzle',
        SG: 'snow grains',
        RA: 'rain',
        SN: 'snow',
        IC: 'ice needles',
        PE: 'freezing rain (ice)',
        GS: 'ice pellet (ice)',
        FZRA: 'supercooled rain (ice)',
        FZDZ: 'supercooled drizzle (ice)',
        TSRA: 'rainstorm',
        TSGR: 'hailstorm',
        TSGS: 'thunderstorm, light hail',
        TSSN: 'Snowstorm',
        TS: 'thunderstorm without precipitation',
        SQ: 'flurry',
        GR: 'grad'
    }
};

const _propSequense = [
    {
        metarProp: 'wind',
        neededProps: [
            {
                name: 'speed_mps',
                prefix: 'Wind',
                postfix: ' м/с'
            },
            {
                name: 'degrees',
                prefix: '',
                postfix: '°'
            }
        ]
    },
    {
        metarProp: 'visibility',
        neededProps: [
            {
                name: 'meters_float',
                prefix: 'Visibility',
                postfix: ' км'
            }
        ]
    },
    {
        metarProp: 'conditions',
        neededProps: [
            {
                name: 'code'
            }
        ]
    },
    {
        metarProp: 'clouds',
        neededProps: [
            {
                name: 'base_feet_agl',
                prefix: '',
                postfix: "'"
            },
            {
                name: 'code',
                prefix: '',
                postfix: ''
            }
        ]
    },
    {
        metarProp: 'temperature',
        neededProps: [
            {
                name: 'celsius',
                prefix: 'Air temperature',
                postfix: '°C'
            }
        ]
    },
    {
        metarProp: 'dewpoint',
        neededProps: [
            {
                name: 'celsius',
                prefix: 'Dew point',
                postfix: ''
            }
        ]
    },
    {
        metarProp: 'barometer',
        neededProps: [
            {
                name: 'mb',
                prefix: 'Sea level pressure',
                postfix: ' GPa'
            }
        ]
    }
];

fetchBtn.addEventListener('click', makeQuery);
codeInput.addEventListener('keyup', function (e) {
    if (e.which === 13) {
        makeQuery();
    }
});

function makeQuery() {
    console.clear();
    const query = ['metar', 'taf'];

    query.forEach((q) => {
        fetch(`${_apiUrls.checkwx}/${q}/${codeInput.value}/decoded`, {
            headers: {
                'x-api-key': _apiKeys.checkwx
            }
        })  
            .then(res => res.json())
            .then(res => {
                const outputBlock = metarDecBlock.querySelector('.info');
                const data = res.data[0];

                if (data) {
                    showInfo(true);
                    const weather = d.querySelector('.' + q + ' .info');
                    const airport = infoBlock.querySelector('.airport .info');

                    weather.textContent = data.raw_text;

                    const {name} = data.station;
                    const {icao} = data;
                    airport.textContent = `[${icao.toUpperCase()}] ${name}`;

                    // if (q === 'metar') outputBlock.textContent = metarDecr(data);
                    if (q === 'metar') outputBlock.textContent = metarDecr(data);
                } 
                else {
                    showInfo(false);
                }
            })
            .catch(e => {
                console.log(e);
                showInfo(false);
            });
    });
}


function showInfo(param) {
    if (param === true) {
        infoBlock.classList.remove('disabled');
        errorBlock.classList.add('disabled');
        metarDecBlock.classList.remove('disabled');
        metarDecBlock.classList.remove('disabled');
    } else {
        infoBlock.classList.add('disabled');
        errorBlock.classList.remove('disabled');
        metarDecBlock.classList.add('disabled');
        metarDecBlock.classList.add('disabled');
    }
}

function metarDecr(metar) {
    console.log(metar);

    let outputString = '';
    _propSequense.forEach((props) => {
        props.neededProps.forEach((prop) => {
            let target = '', localString = '', lastIndex = -1;
            const {prefix, postfix} = prop;
            const metarProp = props.metarProp;

            if (Array.isArray(metar[metarProp])) {
                lastIndex = metar[metarProp].length - 1;

                switch (metarProp) {
                    case 'clouds':
                        target = metar[metarProp][lastIndex][prop.name];
                        break;
                    case 'conditions':
                        if (metar[metarProp].length > 0) {
                            metar[metarProp].forEach(item => target += item.code)
                        }
                        break;
                }
            } else {
                target = metar[metarProp][prop.name];
            }

            if (prop.name) {
                switch (prop.name) {
                    case 'base_feet_agl':
                        break;
                    case 'code':
                        if (target === 'CAVOK') {
                            localString = `${_dictionary.clouds[target]}. `;
                        } else {
                            if (metarProp === 'clouds') {
                                localString = `cloudiness ${_dictionary.clouds[target]} on high ${metar[props.metarProp][lastIndex].base_feet_agl}'. `;
                            } else {
                                if (target !== '') {
                                    localString = `${_dictionary.conditions[target]}. `
                                }
                            }
                        }
                        break;
                    case 'meters_float':
                        target = target / 1000;
                        if (target === 10) target = 'more 10';
                        localString = metFormat(prefix, target, postfix);
                        break;
                    default:
                        localString = metFormat(prefix, target, postfix);
                        break;
                }
            }

            outputString += localString;
        });
    });

    function metFormat(x, y, z) {
        return `${x ? x + ' ' : ''}${y}${z ? z + '. ' : '. '}`
    }

    return outputString.toUpperCase();
}