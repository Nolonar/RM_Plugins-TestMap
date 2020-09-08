/* 
 * MIT License
 * 
 * Copyright (c) 2020 Nolonar
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//=============================================================================
// Metadata
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Adds option to launch test map instead of regular game.
 * @author Nolonar
 * @url https://github.com/Nolonar/RM_Plugins
 * 
 * @param mapId
 * @text Map ID
 * @desc The ID of the test map.
 * @type number
 * @min 1
 * @default 1
 * 
 * @param x
 * @text X position
 * @desc The X position where to put the player on the test map.
 * @type number
 * @min 0
 * @default 0
 * 
 * @param y
 * @text Y position
 * @desc The Y position where to put the player on the test map.
 * @type number
 * @min 0
 * @default 0
 * 
 * 
 * @help Version 1.0.1
 * 
 * This plugin does not provide plugin commands.
 * 
 * This plugin disables autosave for the map defined as test map.
 */

(() => {
    const PLUGIN_NAME = "N_TestMap";

    const TEXT_TEST = "Test map";
    const SYMBOL_TEST = "test";

    let parameters = PluginManager.parameters(PLUGIN_NAME);
    parameters.mapId = Number(parameters.mapId) || 1;
    parameters.x = Number(parameters.x) || 1;
    parameters.y = Number(parameters.y) || 1;

    class Scene_Test extends Scene_Map {
        isAutosaveEnabled() {
            return false;
        }

        updateTransferPlayer() {
            if ($gamePlayer.isTransferring()) {
                SceneManager.goto(Scene_Test);
            }
        }
    }

    let Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function () {
        if ($gameTemp.isPlaytest())
            this.addCommand(TEXT_TEST, SYMBOL_TEST);

        Window_TitleCommand_makeCommandList.call(this);
    }

    let Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function () {
        Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler(SYMBOL_TEST, function () {
            DataManager.setupNewGame();

            // Inject testmap coordinates.
            const mapId = parameters.mapId;
            const x = parameters.x;
            const y = parameters.y;
            $gamePlayer.reserveTransfer(mapId, x, y, 2, 0);

            this._commandWindow.close();
            this.fadeOutAll();
            SceneManager.goto(Scene_Test);
        }.bind(this));
    }

    const Scene_ItemBase_checkCommonEvent = Scene_ItemBase.prototype.checkCommonEvent;
    Scene_ItemBase.prototype.checkCommonEvent = function () {
        if (!(SceneManager._scene instanceof Scene_Test))
            Scene_ItemBase_checkCommonEvent.call(this);
        else if ($gameTemp.isCommonEventReserved())
            SceneManager.goto(Scene_Test);
    };
})();
