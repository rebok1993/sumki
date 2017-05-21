$(function () {
    $("#id_category").on("change", function (event) {
        event.stopPropagation();
        var el  = $(this).val();
        document.location.href = "/admin/sumki_online/item/add/?category="+el;
        /*$.get("/admin/sumki_online/item/my_view/",{"category":el})
            .done(function (data_json) {
                console.log("Успешно", data_json);
                $("#item_form .module.aligned ").append(data_json)
            })
            .fail(function (data) {
                console.log("Плохо",data)
            });*/
    })
});