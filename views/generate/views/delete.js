define(['jquery', 'Backbone', 'confirm_change'], function ($, Backbone, ConfirmView) {
    var DeleteView = Backbone.View.extend({

        render:function (opts) {
            var confirm = new ConfirmView({
                defaults:{
                    body:'Are you sure you want to delete ${schema.modelName} "' + opts.id + '"?',
                    button:'Delete ',
                    title:'Delete  ${schema.modelName}"' + opts.id + '"'
                }
            });

            confirm.render('show', function onDelete() {
                $.ajax({type:'delete',
                    url:'/api/${schema.modelName}',
                    data:{_id:opts.id},
                    success:function (resp) {
                        if (resp.status == 0) {
                            window.location.hash = '#/${schema.modelName}/list'
                        }
                    }});
            });
        }
    });
    return DeleteView;
})