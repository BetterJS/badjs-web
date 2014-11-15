!function (root, $, Delegator, modal) {
    var container;

    function hide() {
        container.removeClass('in');
        container.find('.modal-backdrop').removeClass('in');
        setTimeout(function () {
            container.remove();
        }, 300);
    }

    root.Dialog = function (param) {
        if (container) {
            container.remove();
            container = undefined;
        }
        container = $(modal(param))
            .appendTo(document.body)
            .show();

        (new Delegator(container))
            .on('click', 'close', hide);

        setTimeout(function () {
            container.addClass('in');
            container.find('.modal-backdrop').addClass('in');
        }, 0);

    };
}(window, jQuery, Delegator, modal);