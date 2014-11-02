!function (root, $, Delegator) {

    new Delegator(document.body)
        .on('click', 'showHistory', function () {
            $('#sel-business').val();
        }).on('click', 'showCurrent', function () {
            $('#sel-business').val();
        }).on('click', 'toggleMore', function () {
            toggleMore(this);
        }).on('click', 'addRule', function () {
            
        });

    function toggleMore(ele) {
        ele = $(ele);
        if (ele.is(':checked')) {
            $('#more-container').show();
        } else {
            $('#more-container').hide();
        }
    }

}(window, jQuery, Delegator);