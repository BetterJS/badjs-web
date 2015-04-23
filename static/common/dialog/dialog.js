var Delegator = require("delegator");
var modal = require("./modal.ejs");

    var container;

    function hide() {
        container.removeClass('in');
        container.find('.modal-backdrop').removeClass('in');
        setTimeout(function () {
            container.remove();
            container = undefined;
        }, 300);
    }

    function Dialog (param) {
        if (container) {
            container.remove();
            container = undefined;
        }
        container = $(modal({it :param}))
            .appendTo(document.body)
            .show();

        var key,
            action,
            delegator,
            on = param.on || {};

        delegator = (new Delegator(container))
            .on('click', 'close', hide);

        for (key in on) {
            action = key.split('/');
            delegator.on(action[0], action[1], on[key]);
        }

        setTimeout(function () {
            container.addClass('in');
            container.find('.modal-backdrop').addClass('in');
        }, 0);
    }

    Dialog.hide = hide;

module.exports =  Dialog;