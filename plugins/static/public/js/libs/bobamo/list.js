// Filename: views/${schema.modelName}/list
define([
    'jquery',
    'underscore',
    'Backbone',
    'replacer',
    'libs/table/jquery.bobamo-paginate',
    'libs/table/jquery.sorter'

], function ($, _, Backbone, replacer) {
    "use strict";
    function _null(v) {
        return v != null;
    }

    ;
    function _dir(v) {
        if (v.direction)
            return replacer('<span class="sortable elementActivate" data-field="{field}" data-label="{label}" data-direction="{direction}">{label}</span>',v);

        return null;
    }

    ;
    var ListView = Backbone.View.extend({
        tagName:'div',
        classNames:['span7'],
        events:{
            'paginate-change .pager_table':'doPage',
            'sorter-change .sortable':'onSort'
        },
        initialize:function () {
            if (!this.template) {
                throw new Error('template must be defined');
            }
            if (!this.collection){
                throw new Error('collection must be defined');
            }
            return this;
        },
        renderItem:function (item) {
            var template = this.listItemTemplate;
            if (this.$ul) {
                var lel = new ListItemView({model:item, template:template}).render().el;
                this.$ul.append(lel);
            }
            return this;
        },
        renderList:function () {
            this.$ul = this.$el.find('tbody').empty();
            _.each(this.collection.models, this.renderItem, this);
            return this;
        },
        sorts:[],
        doPage:function (evt) {
            this.update('Loading page <b>' + evt.page + '</b> of {items}');
            return this;
        },
        update:function (message) {
            var $p = this.$paginate.paginate('wait', message);

            var self = this;
            var data = {
                limit:parseInt($p.attr('data-limit')),
                skip:Math.max(0, parseInt($p.attr('data-skip')))
            };
            var sort = [];
            _.each(this.sorts, function (v, k) {
                if (!v.direction) return;
                sort.push([v.field, v.direction].join(':'));
            });

            data.sort = sort.join(',');
            this.collection.fetch({
                data:data,
                success:function (arg, resp) {
                    self.renderList();
                    resp.sort = self.sort_str ? ' sorting by: ' + self.sort_str : '';
                    $p.paginate('update', resp).find('.sortable').sorter();
                }});
            return this;
        },
        onSort:function (evt) {
            var obj = {field:evt.field, direction:evt.direction, label:evt.label};
            this.sorts = _.filter(this.sorts, function (v, k) {
                return v.field != obj.field;
            })
            this.sorts.unshift(obj);
            var str = _(this.sorts).map(_dir).filter(_null).join(', ')
            this.sort_str = str;
            this.update('Sorting {items} ' + ( str ? 'by ' + str : 'naturally' )+'.');

            return this;
        },
        render:function (obj) {
            this.$container = obj && obj.container ? $(obj.container) : $('#content');
            this.$table = $(this.template());
            this.$paginate = $('.pager_table', this.$table).paginate();
            $('.sortable', this.$table).sorter();
            this.$el.append(this.$table);
            this.update();
            this.$container.empty().append(this.$el);
            return this;
        }
    });
    var ListItemView = Backbone.View.extend({
        tagName:"tr",
        initialize:function () {
            this.model.bind("change", this.render, this);
            this.model.bind("destroy", this.close, this);
            return this;
        },

        render:function (eventName) {
            var tmpl = (this.template || this.options.template)({item:this.model});
            var $el = $(this.el);
            $el.html(tmpl);
            return this;
        }

    });
    return ListView;
});
