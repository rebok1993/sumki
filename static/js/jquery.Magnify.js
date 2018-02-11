var large, zoom_image, small, new_image = true, flag1 = false;

function update_el() {
    large = $(".large");
    zoom_image = $('.zoom_image');
    new_image = true;
}

$(document).ready(function(){
	var native_width = 0;
	var native_height = 0;
	var small_width, small_height = 0;
	var large_width, large_height = 0;
	var zoom_width, zoom_height = 0;
	var id_time;
	var status = false;
    new_image = true;
	large = $(".large"); //лупа
	zoom_image = $('.zoom_image'); //увеличенное изображение
    small = $(".small"); //стандартное изображение

	var magnify_out = function () {
		id_time = setTimeout(function () {
			native_width = 0;
			native_height = 0;
			large.fadeOut(100);
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
        if(!native_width && !native_height)
		{
			native_width = Math.round(small.width())*2;//ширина увеличенного изображения
			native_height = Math.round(1048);//высота увеличенного изображения small.height() 1316
			small_width = small.width();
			small_height = small.height();
			large_width = large.width();
			large_height = large.height();
			zoom_width = zoom_image.width();
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
				/*large.fadeIn(100);*/
				zoom_image.fadeIn(100);
				status = true;
			}
			else
			{
				native_width = 0;
				native_height = 0;
				/*large.fadeOut(100);*/
				zoom_image.fadeOut(100);
				status = false;
			}
			//вводим допустимые значения
			/*mx = Math.max(mx, large_width/2);*/
			/*my = Math.max(my, large_height/2);*/
			/*mx = Math.min(mx, small_width-large_width/2);*/
			/*my = Math.min(my, small_height-large_height/2);*/
			my = Math.max(my, 15);
			my = Math.min(my,391);

			//если лупа показана
			if(status)
			{
				//изменение увеличенного изображение
				/*var rx = Math.round(mx/small_width*native_width - zoom_width/2)*-1;*/
				var ry = Math.round(my/small_height*native_height)*-1;
				//Положение лупы
				/*var px = mx - large_width/2;*/
				/*var py = my - large_height/2;*/

				/*large.css({left: px, top: py});*/
				zoom_image.find('img').css({left: 0, top: ry}); /*rx*/
				/*$('.zoom_image img').css('transform', 'scale(2,2) translate('+rx+'px,'+ry+'px)');*/
			}
		}
    };

	$("#fon_wait").on('mousemove', '.magnify', magnify);
	$("#fon_wait").on('mouseout', '.magnify', magnify_out);
});