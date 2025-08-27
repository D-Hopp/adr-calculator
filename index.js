const ADV=1, DISADV=2, NONE=0, AC=0, STR_SAVE=1, DEX_SAVE=2, CON_SAVE=3, INT_SAVE=4, WIS_SAVE=5, CHA_SAVE=6, TARGET_STATS_TEMPLATE=7;
const STATS_MM = 0, STATS_TREANTMONK = 1, STATS_CUSTOM = 2;
const PLAYER_LEVEL=0, PLAYER_STR=1, PLAYER_DEX=2, PLAYER_CON=3, PLAYER_INT=4, PLAYER_WIS=5, PLAYER_CHA=6, PLAYER_PROF=7;
const ACTION_ID=0, ACTION_NAME=1, ACTION_ADV=2, ACITON_HIT=3, ACTION_TARGET=4, ACTION_DAMAGE=5, ACTION_CRITON=6, ACTION_CRITDAMAGE=7, ACTION_MISC_MULTIPLIER=8, ACTION_MISC_MULTIPLIER_2=9;
const DATA_PLAYER=0, DATA_TARGET=1, DATA_ACTION=2, DATA_BONUS_ACTION=3, DATA_REACTION=4, DATA_OFFTURN=5;

function init () {
    insertLevels();
    let data = []
    let targets = TARGETDATA;
    for(let j=AC; j<=CHA_SAVE; j++) {
        let max = -100;
        for(let level=1; level<=20; level++) {
            if(targets[level][j] > max) {
                max = targets[level][j];
            }
            targets[level][j] = Math.round(max);        
        }
    }
    for(const i of [...Array(20).keys().map((x)=>x+1)]) {
        targets[i][TARGET_STATS_TEMPLATE] = 0;    
        data[i]= [
            [i,8,8,8,8,8,8,Math.floor((i-1)/4+2)],
            targets[i],
            [],[],[],[]];
    }
    $('body').data('data',data)
    populate();
    $('#popverimport').on('click',importData);
    $('#exportData').on('click',exportData);
}
function insertLevels () {
    const template = document.querySelector('#levelitem');
    const clonedTemplate = template.content.cloneNode(true);
    for(const i of [...Array(20).keys().map((x)=>x+1)]) {        
        const clonedNode = clonedTemplate.cloneNode(true);
        clonedNode.querySelector('.js-level-details').setAttribute('id',`level${i}`);
        clonedNode.querySelector('.js-level-details').setAttribute('data-level',`${i}`);
        clonedNode.querySelector('.js-level-summary').setAttribute('id',`summary${i}`);
        clonedNode.querySelector('.js-level-item').setAttribute('aria-labelledby',`summary${i}`);
        clonedNode.querySelector('.js-level-headline').textContent = `Level ${i}`;
        clonedNode.querySelector('.js-stat-selector').querySelectorAll('[name=targetstats]').forEach((el)=>el.setAttribute('name',`targetstats${i}`))
        document.querySelector('.js-level-list').appendChild(clonedNode);
        if(i!==1) {
            const $cloneButton = $($('#cloneButton').html());
            $cloneButton.on('click',clonePreviousLevel);
            $(`#level${i} > .js-details-content`).prepend($cloneButton);
        }
    }
    document.querySelector('.js-level-list').querySelector('details').setAttribute('open','open')
    $('.js-add-action-button').on('click',insertAction);
    $('.js-stats input,.js-stats select').add('.js-target input[type=radio]').on('change',updateStats);
}

function insertAction (event) {
    const $action = $($('#action').html()).attr('id', Math.floor(Math.random()*Date.now()));
    $(this).parents('[data-target=action-col]').append($action);
    $action.find('.js-remove-action-buttom').on('click',removeAction);
    $action.on('change',updateAction);
}

function removeAction (event) {
    const id = $(this).parents('.js-action-row').attr('id');
    const level = parseInt($(this).parents('.js-level-details').data('level'));
    const data = $('body').data('data');
    for(let actionType=DATA_ACTION; actionType<=DATA_OFFTURN; actionType++) {
        data[level][actionType] = data[level][actionType].filter((action)=>action[ACTION_ID]!==id)
    }
    $(this).parents('.js-action-row').remove();
}

function clonePreviousLevel(){
    const data = $('body').data('data');
    const level = parseInt($(this).parents('.js-level-details').data('level'));
    data[level][DATA_PLAYER] = data[level-1][DATA_PLAYER];
    data[level][DATA_ACTION] = data[level-1][DATA_ACTION];
    data[level][DATA_BONUS_ACTION] = data[level-1][DATA_BONUS_ACTION];
    data[level][DATA_REACTION] = data[level-1][DATA_REACTION];
    data[level][DATA_OFFTURN] = data[level-1][DATA_OFFTURN];
    populate();
}

function importData(event) {
    const importString = $('#importArea').val();
    const data = JSON.parse(importString)
    $('body').data('data',data);
    populate();
}

function exportData(event) {
    navigator.clipboard.writeText(JSON.stringify($('body').data('data')))
    $(this).text('Exported data to clipboard!')
    setTimeout(function(){
        $('#exportData').text('Export');
    },5000)
}

function populate() {
    const data = $('body').data('data');
    for (let level = 1; level<data.length; level++) {
        const leveldata = data[level]
        const $base = $(`#level${level}`);
        const $player = $base.find('.js-stats');
        const player = leveldata[DATA_PLAYER];
        $player.find('[name=str]').val(player[PLAYER_STR]);
        $player.find('[name=dex]').val(player[PLAYER_DEX]);
        $player.find('[name=con]').val(player[PLAYER_CON]);
        $player.find('[name=int]').val(player[PLAYER_INT]);
        $player.find('[name=wis]').val(player[PLAYER_WIS]);
        $player.find('[name=cha]').val(player[PLAYER_CHA]);

        const $target = $base.find('.js-target');
        const target = leveldata[DATA_TARGET];
        $target.find('[name=ac]').val(target[AC]);
        $target.find('[name=str-save]').val(target[STR_SAVE]);
        $target.find('[name=dex-save]').val(target[DEX_SAVE]);
        $target.find('[name=con-save]').val(target[CON_SAVE]);
        $target.find('[name=int-save]').val(target[INT_SAVE]);
        $target.find('[name=wis-save]').val(target[WIS_SAVE]);
        $target.find('[name=cha-save]').val(target[CHA_SAVE]);
        $target.find(`[name=targetstats${level}]`).val([target[TARGET_STATS_TEMPLATE]]);

        const $actions = $base.find('.c-action > [data-target=action-col]');
        $actions.find('.js-action-row').remove();
        for(const action of leveldata[DATA_ACTION]) {
            const $action = $($('#action').html()).attr('id', action[ACTION_ID]);
            $actions.append($action);
            $action.find('[name=action-name]').val(action[ACTION_NAME]);
            $action.find('[name=adv]').val(action[ACTION_ADV]);
            $action.find('[name=hit]').val(action[ACITON_HIT]);
            $action.find('[name=target]').val(action[ACTION_TARGET]);
            $action.find('[name=damage]').val(action[ACTION_DAMAGE]);
            $action.find('[name=criton]').val(action[ACTION_CRITON]);
            $action.find('[name=crit]').val(action[ACTION_CRITDAMAGE]);
            $action.find('[name=misc_mult_1]').val(action[ACTION_MISC_MULTIPLIER]);
            $action.find('.js-remove-action-buttom').on('click',removeAction);
            $action.find('select, input').add($action).on('change',updateAction);
        }        
        
        const $bonus_actions = $base.find('.c-bonus-action > [data-target=action-col]');
        $bonus_actions.find('.js-action-row').remove();
        for(const action of leveldata[DATA_BONUS_ACTION]) {
            const $action = $($('#action').html()).attr('id', action[ACTION_ID]);
            $bonus_actions.append($action);
            $action.find('[name=action-name]').val(action[ACTION_NAME]);
            $action.find('[name=adv]').val(action[ACTION_ADV]);
            $action.find('[name=hit]').val(action[ACITON_HIT]);
            $action.find('[name=target]').val(action[ACTION_TARGET]);
            $action.find('[name=damage]').val(action[ACTION_DAMAGE]);
            $action.find('[name=criton]').val(action[ACTION_CRITON]);
            $action.find('[name=crit]').val(action[ACTION_CRITDAMAGE]);
            $action.find('[name=misc_mult_1]').val(action[ACTION_MISC_MULTIPLIER]);
            $action.find('.js-remove-action-buttom').on('click',removeAction);
            $action.find('select, input').add($action).on('change',updateAction);
        }       
        
        const $reaction_actions = $base.find('.c-reaction > [data-target=action-col]');
        $reaction_actions.find('.js-action-row').remove();
        for(const action of leveldata[DATA_REACTION]) {
            const $action = $($('#action').html()).attr('id', action[ACTION_ID]);
            $reaction_actions.append($action);
            $action.find('[name=action-name]').val(action[ACTION_NAME]);
            $action.find('[name=adv]').val(action[ACTION_ADV]);
            $action.find('[name=hit]').val(action[ACITON_HIT]);
            $action.find('[name=target]').val(action[ACTION_TARGET]);
            $action.find('[name=damage]').val(action[ACTION_DAMAGE]);
            $action.find('[name=criton]').val(action[ACTION_CRITON]);
            $action.find('[name=crit]').val(action[ACTION_CRITDAMAGE]);
            $action.find('[name=misc_mult_1]').val(action[ACTION_MISC_MULTIPLIER]);
            $action.find('.js-remove-action-buttom').on('click',removeAction);
            $action.find('select, input').add($action).on('change',updateAction);
        }
        
        const $offturn_actions = $base.find('.c-offturn > [data-target=action-col]');
        $offturn_actions.find('.js-action-row').remove();
        for(const action of leveldata[DATA_OFFTURN]) {
            const $action = $($('#action').html()).attr('id', action[ACTION_ID]);
            $offturn_actions.append($action);
            $action.find('[name=action-name]').val(action[ACTION_NAME]);
            $action.find('[name=adv]').val(action[ACTION_ADV]);
            $action.find('[name=hit]').val(action[ACITON_HIT]);
            $action.find('[name=target]').val(action[ACTION_TARGET]);
            $action.find('[name=damage]').val(action[ACTION_DAMAGE]);
            $action.find('[name=criton]').val(action[ACTION_CRITON]);
            $action.find('[name=crit]').val(action[ACTION_CRITDAMAGE]);
            $action.find('[name=misc_mult_1]').val(action[ACTION_MISC_MULTIPLIER]);
            $action.find('.js-remove-action-buttom').on('click',removeAction);
            $action.find('select, input').add($action).on('change',updateAction);
        }
    }
    for(let level = 1; level<=20; level++) {
        calculateLevel(level);
    }
}
 
function updateStats(event) {
    const data = $('body').data('data');
    const level = parseInt($(this).parents('.js-level-details').data('level'));
    const $target = $(this).parents('.js-level-item').find('.js-target');
    const $player = $(this).parents('.js-level-item').find('.js-stats');
    const player = Object.values({
        level: level,
        str: parseNumber($player,'str'),
        dex: parseNumber($player,'dex'),
        con: parseNumber($player,'con'),
        int: parseNumber($player,'int'),
        wis: parseNumber($player,'wis'),
        cha: parseNumber($player,'cha'),
        prof: Math.floor((level-1)/4)+2,
    });    
    let target = Object.values({
        ac: parseNumber($target,'ac'),
        strsave: parseNumber($target,'str-save'),
        dexsave: parseNumber($target,'dex-save'),
        consave: parseNumber($target,'con-save'),
        intsave: parseNumber($target,'int-save'),
        wisave: parseNumber($target,'wis-save'),
        chasave: parseNumber($target,'cha-save'),
        statstemplate: parseInt($target.find(`[name=targetstats${level}]:checked`).val()),
    });
    if(data[level][DATA_TARGET][AC] !== target[AC] || data[level][DATA_TARGET][STR_SAVE] !== target[STR_SAVE] || data[level][DATA_TARGET][DEX_SAVE] !== target[DEX_SAVE] || data[level][DATA_TARGET][CON_SAVE] !== target[CON_SAVE] 
        || data[level][DATA_TARGET][WIS_SAVE] !== target[WIS_SAVE] || data[level][DATA_TARGET][INT_SAVE] !== target[INT_SAVE] || data[level][DATA_TARGET][CHA_SAVE] !== target[CHA_SAVE]
        ||  target[TARGET_STATS_TEMPLATE] == STATS_CUSTOM) {
        target[TARGET_STATS_TEMPLATE] = 2;
        $target.find(`[name=targetstats${level}]`).val([target[TARGET_STATS_TEMPLATE]]);
        $target.find('input, select').removeAttr('disabled').on('change',updateStats);
    }
    let repopulate = false;
    if(target[TARGET_STATS_TEMPLATE] === STATS_MM && target[TARGET_STATS_TEMPLATE] !== data[level][DATA_TARGET][TARGET_STATS_TEMPLATE]) {
        let newTarget = TARGETDATA[level];
        newTarget[TARGET_STATS_TEMPLATE] = STATS_MM;
        target = newTarget;
        $target.find('input, select').not('[type=radio]').attr('disabled','disabled').off('change',updateStats);
        repopulate = true;
    }
    if(target[TARGET_STATS_TEMPLATE] === STATS_TREANTMONK && target[TARGET_STATS_TEMPLATE] !== data[level][DATA_TARGET][TARGET_STATS_TEMPLATE]) {
        let newTarget = TARGETTREANTMONK[level];
        newTarget[TARGET_STATS_TEMPLATE] = STATS_TREANTMONK;
        target = newTarget;
        $target.find('input, select').not('[type=radio]').attr('disabled','disabled').off('change',updateStats);
        repopulate = true;
    }
    
    data[level][DATA_PLAYER] = player;
    data[level][DATA_TARGET] = target;
    calculateLevel(level);
    if(repopulate) {
        populate();
    }
}

function updateAction(event) {
    const data = $('body').data('data');
    const level = parseInt($(this).parents('.js-level-details').data('level'));
    const $action = $(this).is('.js-action-row') ? $(this) : $(this).parents('.js-action-row');
    let actionType = DATA_ACTION; 
    switch ($action.parents('[data-type]').data('type')) {
        case 'bonusaction':
            actionType = DATA_BONUS_ACTION;
            break;
        case 'reaction':
            actionType = DATA_REACTION;
            break;
        case 'offturn':
            actionType = DATA_OFFTURN;
            break;
        default:
    }

    const player = data[level][DATA_PLAYER];
    const target = data[level][DATA_TARGET];
    const action = Object.values({
        id: $action.attr('id'),
        name: $action.find('[name=action-name]').val(),
        adv: parseNumber($action,'adv'),
        hit: $action.find('[name=hit]').val(),
        target: parseNumber($action,'target'),
        damage: $action.find('[name=damage]').val(),
        criton: parseNumber($action,'criton'),
        critdamge: $action.find('[name=crit]').val(),
        multiplier: math.evaluate($action.find('[name=misc_mult_1]').val()),
    });
    
    let found = false;
    if(action != null){
        data[player[PLAYER_LEVEL]][actionType] = data[player[PLAYER_LEVEL]][actionType].map((oldaction)=>{
            if(oldaction[ACTION_ID] === action[ACTION_ID]){
                found = true;
                return action;
            }
            return oldaction;
        })
        if(!found) {
            data[player[PLAYER_LEVEL]][actionType].push(action);
        }
    }
    calculateLevel(level)
}

function calculateLevel(level) {
    const data = $('body').data('data');
    const player = data[level][DATA_PLAYER];
    const target = data[level][DATA_TARGET];
    let total = 0;
    for(let actionType=DATA_ACTION; actionType<=DATA_OFFTURN; actionType++) {
        data[level][actionType].forEach((action)=>{
            const resultText = calculateAction(data,level,player,target,action);
            total += resultText;
            $(`#level${level} #${action[ACTION_ID]}`).find('[data-value=value]').text(resultText);
        })
    }
    $(`#level${level} .js-total`).text(`[${total} ADR]`)
    
}

function calculateAction (data,level,player,target,action) {
    let hitchance = 0;
    let critchance = 0;
    if(action[ACTION_TARGET] === AC) {
        hitchance = Math.min(1, Math.max(1, 21 - target[AC] + parseDice(action[ACITON_HIT],player)) / 20);
        critchance = (21 - action[ACTION_CRITON]) / 20;
        switch (action[ACTION_ADV]) {
            case ADV:
                hitchance = 2*hitchance-hitchance*hitchance;
                critchance = 2*critchance-critchance*critchance;
                break;
            case DISADV:
                hitchance = hitchance*hitchance;
                critchance = critchance*critchance;
                break;
            default:
        }
    } else {
        hitchance = Math.min(1,Math.max(0, 1 - (21 - (8 + parseDice(action[ACITON_HIT],player)) + target[action[ACTION_TARGET]]) / 20));        
        switch (action[ACTION_ADV]) {
            case ADV:
                hitchance = 2*hitchance-hitchance*hitchance;
                critchance = 2*critchance-critchance*critchance;
                break;
            case DISADV:
                hitchance = hitchance*hitchance;
                critchance = critchance*critchance;
                break;
            default:
        }
    }
    const multiplier = action[ACTION_MISC_MULTIPLIER] == null || Number.isNaN(action[ACTION_MISC_MULTIPLIER]) ? 1 : action[ACTION_MISC_MULTIPLIER];
    const result = multiplier * (hitchance * Math.max(0,parseDice(action[ACTION_DAMAGE],player)) + critchance * Math.max(0,parseDice(action[ACTION_CRITDAMAGE],player)));
    return !Number.isNaN(result) ? Math.round(result*100)/100 : 0;
}

function calculateModifier(int) {
    return Math.floor((int-10)/2);
}

function parseDice (str,playerArr) {
    const player = {
        level: playerArr[PLAYER_LEVEL],
        prof: playerArr[PLAYER_PROF],
        str: playerArr[PLAYER_STR],
        dex: playerArr[PLAYER_DEX],
        con: playerArr[PLAYER_CON],
        int: playerArr[PLAYER_INT],
        wis: playerArr[PLAYER_WIS],
        cha: playerArr[PLAYER_CHA],
    }
    str = str.toLowerCase();
    for(const [key, value] of Object.entries(player)) {
        if(key === 'level' || key === 'prof') {
            str = str.replace(new RegExp(key,'gu'),value);
        } else {
            str = str.replace(new RegExp(key,'gu'),calculateModifier(value));
        }
    }
    str = str.replace(/s/gu,'').replace(/(\d)d(\d)/gu,'$1*d$2');
    str += ' ';
    for(const i of [...Array(21).keys(),100].reverse()) {
        str = str.replace(new RegExp(`d${i}([^\d])`,'gu'),`${(i+1)/2}$1`)
    }
    const result = math.evaluate(str);
    return result == null ? 0 : result;
}

function parseNumber ($el, name) {
    return parseInt($el.find(`[name=${name}]`).val())
}

const TARGETDATA = [
    [11.13,-2.38,0.88,0.00,-3.69,0.19,-2.97], //CR0
    [12.90,0.81,1.74,1.00,-1.48,0.50,-0.74], //CR1
    [13.36,2.20,1.63,1.88,-1.44,0.86,-1.00],
    [14.15,2.80,1.66,2.20,-0.61,1.27,-0.24],
    [14.48,1.89,1.70,2.41,-0.04,1.33,0.89],
    [15.28,3.86,1.58,3.94,-1.33,1.28,-0.19],
    [15.65,3.30,3.57,3.30,0.65,3.17,1.30],
    [15.94,4.25,2.69,4.31,0.44,2.94,0.75],
    [15.83,4.48,2.52,4.65,1.22,3.74,1.30],
    [16.75,6.17,1.58,5.67,0.67,2.92,2.33],
    [17.50,4.13,4.94,5.31,3.06,5.94,4.44],
    [17.17,5.33,4.42,5.08,1.58,4.33,3.83],
    [17.86,4.86,5.14,4.71,5.00,6.14,4.86],
    [17.33,5.44,4.22,6.89,2.89,5.89,5.00],
    [18.50,5.25,5.50,6.50,3.50,6.75,5.25],
    [17.67,7.17,4.33,5.50,2.17,6.67,4.00],
    [18.71,7.14,3.86,7.86,2.86,6.29,4.71],
    [19.14,7.71,5.43,8.57,2.57,8.29,4.14],
    [20.00,-5.00,11.00,6.00,11.00,9.00,5.00],
    [19.00,8.00,2.00,12.00,5.00,9.00,6.00],
    [20.00,7.75,6.75,8.25,3.25,9.25,5.75], //CR20
    [20.80,6.20,8.40,7.60,6.20,9.20,6.40],
    [21.00,8.33,8.67,10.00,2.67,9.67,6.33],
    [20.67,13.00,6.67,11.33,4.00,9.83,6.00],
    [22.00,10.00,8.00,9.00,4.00,9.50,8.50],
    [23.00,10.00,8.00,10.00,-4.00,8.00,-1.00],
    [25.00,10.00,9.00,10.00,5.00,9.00,9.00]
]

const TARGETTREANTMONK = [
    [13,0,0,0,0,0,0], //0
    [14,0,0,0,0,0,0], //1
    [14,0,0,0,0,0,0],
    [14,0,0,0,0,0,0],
    [15,1,1,1,1,1,1], 
    [16,2,2,2,2,2,2], //5
    [16,2,2,2,2,2,2], 
    [16,2,2,2,2,2,2], 
    [17,3,3,3,3,3,3], //8
    [18,4,4,4,4,4,4], //9
    [18,4,4,4,4,4,4], 
    [18,4,4,4,4,4,4], 
    [18,4,4,4,4,4,4], 
    [19,5,5,5,5,5,5], //13
    [19,5,5,5,5,5,5], 
    [19,5,5,5,5,5,5], 
    [19,5,5,5,5,5,5], 
    [20,6,6,6,6,6,6], //17
    [20,6,6,6,6,6,6], 
    [20,6,6,6,6,6,6], 
    [20,6,6,6,6,6,6], //20
]

init();
