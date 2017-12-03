var large, zoom_image, small, new_image = true, flag1 = false;

function update_el() {
    large = $(".large");
    zoom_image = $('.zoom_image');
    new_image = true;
}

$(document).ready(function(){
	var native_width = 0;
	var native_height = 0;
    new_image = true;
	large = $(".large");
	zoom_image = $('.zoom_image');
    small = $(".small");

    var magnify = function (e) {
		if(!flag1) return;
        if(new_image){
            new_image = false;
            small = $(".small");
            zoom_image.find('img').attr("src",small.attr("src"));
        }
        if(!native_width && !native_height)
		{
			native_width = Math.round(small.width())*2;
			native_height = Math.round(small.height())*2;
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
				large.fadeIn(100);
				zoom_image.fadeIn(100);
			}
			else
			{
				native_width = 0;
				native_height = 0;
				large.fadeOut(100);
				zoom_image.fadeOut(100);
			}
			//вводим допустимые значения
			mx = Math.max(mx, large.width()/2);
			my = Math.max(my, large.height()/2);
			mx = Math.min(mx, small.width()-large.width()/2);
			my = Math.min(my, small.height()-large.height()/2);

			//если лупа показана
			if(large.is(":visible"))
			{
				var rx = Math.round(mx/small.width()*native_width - zoom_image.width()/2)*-1;
				var ry = Math.round(my/small.height()*native_height - zoom_image.height()/2)*-1;

				//Положение лупы
				var px = mx - large.width()/2;
				var py = my - large.height()/2;

				large.css({left: px, top: py});
				zoom_image.find('img').css({left: rx, top: ry});
				/*$('.zoom_image img').css('transform', 'scale(2,2) translate('+rx+'px,'+ry+'px)');*/
			}
		}
    };

	$("#fon_wait").on('mousemove', '.magnify', magnify);
});