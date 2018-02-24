var zoom_image, small, new_image = true, flag1 = false;

function update_el() {
    zoom_image = $('.zoom_image');
    new_image = true;
}

$(document).ready(function(){
	var native_height = 0;
	var small_height = 0;
	var zoom_height = 0;
	var id_time;
	var status = false;
    new_image = true;
	zoom_image = $('.zoom_image'); //увеличенное изображение
    small = $(".small"); //стандартное изображение

	var magnify_out = function () {
		id_time = setTimeout(function () {
			native_height = 0;
			zoom_image.fadeOut(100);
		}, 500);
	};

    var magnify = function (e) {
		clearTimeout(id_time);
		if(!flag1) return;
        if(new_image){
            new_image = false;
            small = $(".small");
            zoom_image.find('img').attr("src",small.attr("src"));
        }
        if(!native_height)
		{
			native_height = Math.round(1048);//высота увеличенного изображения small.height() 1316
			small_height = small.height();
			zoom_height = zoom_image.height();
		}
		else
		{
			//размеры оболочки
			var magnify_offset = $(this).offset();

			//положение курсора относительно маленькой картинки
			var mx = e.pageX - magnify_offset.left;
			var my = e.pageY - magnify_offset.top;

			//показывает или убираем лупу
			if(mx < ($(this).width()-10) && my < ($(this).height()-10) && mx > 10 && my > 10)
			{
				zoom_image.fadeIn(100);
				status = true;
			}
			else
			{
				native_height = 0;
				zoom_image.fadeOut(100);
				status = false;
			}
			//вводим допустимые значения
			my = Math.max(my, 15);
			my = Math.min(my,391);

			//если лупа показана
			if(status)
			{
				//изменение увеличенного изображение
				var ry = Math.round(my/small_height*native_height)*-1;
				//Положение лупы
				zoom_image.find('img').css({left: 0, top: ry}); /*rx*/
			}
		}
    };

	$("body").on('mousemove', '.magnify', magnify);
	$("body").on('mouseout', '.magnify', magnify_out);
});