
const removePrefix = function(blockName) {

    var firstChar = blockName.charAt(0);
    if (firstChar == "/") blockName = blockName.substring(1);
    return blockName;
}

const blockFromState = function (blockName, takeOffPrefix) {

    if(takeOffPrefix) blockName = removePrefix(blockName);
    return blockName.split('_')[0];
}

const buildNewBlockPath = function (state, dataPaths) {

    var defaultState = blockFromState(state);
    var defaultFilename = removePrefix(defaultState);
    var stateFilename = removePrefix(state);
    var defaultPath = dataPaths[defaultState];
    return defaultPath.replace(defaultFilename + ".json", stateFilename + ".json");
}

module.exports = {
    blockFromState,
    buildNewBlockPath
}