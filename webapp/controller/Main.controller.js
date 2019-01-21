sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"

], function (Controller, Fragment, JSONModel) {
    "use strict";

    var _currentPizza;
    var dialogConfirm = 0;
    return Controller.extend("untitled.controller.View1", {
        _formFragments: {},

        postEntity: function (){
            var oModel = this.getView().getModel("oDataES5");

            var toppings = [];
            var core = sap.ui.getCore();
            //var oModel = oEvent.getSource().getModel("pedidosPizza");
            var pizzas = core.byId($(".pizzas")[$(".pizzas").length - 1].id).getSelectedItem().getText();

            if (this._comprobateAniadir()) {
                var base = core.byId($(".base")[$(".base").length - 1].id).getSelectedItem().getText();
                var arrToppings = core.byId($(".toppings")[$(".toppings").length - 1].id).getSelectedItems();

                for (var i = 0; i < arrToppings.length; i++)
                    toppings[i] = arrToppings[i].getText();

                if (setproperty === "/") {
                    oModel.setProperty(setproperty, oModel.getProperty(originalproperty).concat({
                        pizzaName: pizzas,
                        base: base,
                        toppings: toppings,
                    }));
                } else {
                    oModel.setProperty(setproperty, {
                        pizzaName: pizzas,
                        base: base,
                        toppings: toppings,
                    });
                }
            }
        },
        onInit: function () {
            var model = new sap.ui.model.json.JSONModel();
            model.setData({
                data: {
                    localidad: {},
                    via: {},
                    piso: {},
                    direccion: {},
                    metodoDePago: {},
                    entrega: {},
                    hora: {}
                },
                profile: {
                    nombre: {},
                    apellido: {},
                    telefono: {}
                }
            });

            this.getView().setModel(model, "datosPersonales");
            this.getView().setModel(new sap.ui.model.json.JSONModel("model/products.json")); //¿Porque es necesario para la smartlist si esta usa un modelo con nombre y no el default?
            //this.getView().setModel(new sap.ui.model.json.JSONModel("model/products.json"));
            //this.getView().setModel(new sap.ui.model.json.JSONModel("model/pizzaBaseToppings.json"), "pizzaBaseToppings");
            //this.getView().setModel(this.getView().getModel("products")); en un futuro poder iniciar el model desde component.js
            this._showFormFragment("untitled.view.change");
            this.getView().byId("edit").setEnabled(true);
            console.log(sap.ui.getCore().getModel());
        },
        onAfterRendering: function () {
            this._setHourMore30();
        },
        onExit: function () {},
        handleEditPress: function () {
            this._toggleButtonsAndView(false);
        },
        handleCancelPress: function () { //TODO crear funcion que compruebe datos anteriores (desde Modelos) con los actuales (inputs) para cancel/save
            this._toggleButtonsAndView(true);
        },
        handleSavePress: function () {
            if (this._setProfile(this._getProfile()) && this._checkPizza())
                if (this._setContact(this._getContact()))
                    this._toggleButtonsAndView(true);
        },
        ponerContacto: function () {
            this._setContact(this._getContact()); //Porque al hacer usar esta funcion en un boton del fragmento no cambia el bind en el display y mediante un boton en el view si
        },
        delimitTimeRange: function (oEvent) {
            var now = new Date();
            var start = new Date(now.getTime() + 30 * 60 * 1000);

            var end = new Date();
            end.setHours(23, 59, 59, 999);

            var hours = oEvent.getSource().getDateValue().getHours();
            var mins = oEvent.getSource().getDateValue().getMinutes();
            var seconds = oEvent.getSource().getDateValue().getSeconds();

            now.setHours(0, 0, 0, 0);

            var hourFixed = new Date(
                now.getTime() +
                hours * 60 * 60 * 1000 +
                mins * 60 * 1000 +
                seconds * 1000
            );

            if (oEvent.getParameter("invalidValue") || hourFixed < start || hourFixed > end) {
                oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
            } else {
                oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
            }
            oEvent.getSource().setDateValue(hourFixed);
        },
        aniadirPizza: function (oEvent) {
            this._addPizza(oEvent, "/", "/");
            var hora = sap.ui.getCore().byId($(".hora")[$(".hora").length - 1].id);

            var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                pattern: "kk:mm:ss"
            });

        },
        deletePizza: function (oEvent) {
            var index = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath().split('/')[1];
            var oModel = this.getView().getModel("pedidosPizza");
            var oData = oModel.getData();
            oData.splice(index, 1);
            oModel.setData(oData);
            oModel.refresh();
        },
        hacerAlgo: function () {
            var texto = sap.ui.getCore().byId($(".textoPrueba")[$(".textoPrueba").length - 1].id);

            var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                pattern: "kk:mm:ss"
            });

            var now = new Date();
            var more30 = new Date(now.getTime() + 30 * 60 * 1000);
            var timeStr = timeFormat.format(more30);

            texto.setText(timeStr);
        },
        personalizar: function (oEvent) {
            var selected = sap.ui.getCore().byId($(".aniadir")[$(".aniadir").length - 1].id);
            var pizzas = sap.ui.getCore().byId($(".pizzas")[$(".pizzas").length - 1].id);
            var base = sap.ui.getCore().byId($(".base")[$(".base").length - 1].id);
            var toppings = sap.ui.getCore().byId($(".toppings")[$(".toppings").length - 1].id);
            if (this._comprobateAniadir()) {
                pizzas.setSelectedKey("Pizza Personalizada");
                pizzas.setEnabled(false);
                base.setEnabled(true);
                toppings.setEnabled(true);
            } else {
                pizzas.setEnabled(true);
                base.setEnabled(false);
                toppings.setEnabled(false);
            }
            //		baseBind.bindElement("optionPizza>/personalizada/0");//entramos a un array y dentro hay otro del cual usaremos el objeto 0
        },
        openEditPizza: function (oEvent) {
            var item = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath(); //Porque no conserva el binding context
            var form = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getParent().getContent()[1];

            if (item != _currentPizza || _currentPizza == undefined) {
                if (form.getVisible()) {
                    this._openDialog();
                    if (dialogConfirm)
                        form.setVisible(false);
                    else
                        console.log("cierre item != _currentPizza");

                } else
                    form.setVisible(true);
                console.log(item);
                console.log(_currentPizza);
                console.log("-------------------------------");
            } else {
                console.log(item);
                console.log(_currentPizza);
                console.log("item == _currentPizza");
                console.log("-------------------------------");
                sap.m.MessageToast.show("Error");
                if (form.getVisible()) {
                    console.log("false");
                    form.setVisible(false);
                } else
                    form.setVisible(true);
            }
            //	var oObject = oEvent.getSource().getBindingContext().getObject(); //Recuperar objeto que ha hecho click mediante el evento
            //	console.log(oObject.pizzaName); //recuperar una propiedad

            _currentPizza = item;
            //	var context = oEvent.getSource().getBinding();
            //console.log(item);
            var index = item.split('/')[1];
            //	sap.m.MessageToast.show("Item Index = " + index);
        },
        editPizza: function (oEvent) {
            this._addPizza(oEvent, _currentPizza, _currentPizza);
        },
        setVisibleBaseToppings: function (oEvent) {
            var form = oEvent.getSource().getContent()[0].getContent()[1];
            form.setVisible(!form.getVisible());
            this._changeArrowListPosition(
                form.getVisible(),
                oEvent,
                "sap-icon://navigation-down-arrow",
                "sap-icon://navigation-right-arrow");
        },
        openDomicilio: function (oEvent) {
            var grid = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getContent()[3];
            grid.setVisible(!grid.getVisible());
        },
        _checkPizza: function () {
            if (this.getView().getModel("pedidosPizza").getData().length < 1) {
                sap.m.MessageToast.show("Porfavor añada una o mas pizzas");
                return false;
            } else
                return true;
        },
        _setHourMore30: function () {
            var hora = sap.ui.getCore().byId($(".hora")[$(".hora").length - 1].id); //TODO NECESITAMOS SETEAR EL VALOR DE INICIO EL MORE30

            var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                pattern: "kk:mm:ss"
            });

            hora.setDateValue(this._getHourOrder());
            var timeStr = timeFormat.format(this._getHourOrder());
            //TODO implementar limites (date range start end) al abrir el timepicker, comprobacion de que estos mismos limites se estan respetando
        },
        _getHourOrder: function () {
            var now = new Date();
            var more30 = new Date(now.getTime() + 30 * 60 * 1000);
            return more30;
        },
        _getProfile: function () {

            var core = sap.ui.getCore();

            var nombre = core.byId($(".nombre")[$(".nombre").length - 1].id).getValue();
            var apellido = core.byId($(".apellido")[$(".apellido").length - 1].id).getValue();
            var telefono = core.byId($(".telefono")[$(".telefono").length - 1].id).getValue();

            console.log(nombre + "\n" + apellido + "\n" + telefono + "aaaaaaaaaaa");

            if (nombre != "" && apellido != "" && telefono != "") {
                var arr = [
                    nombre,
                    apellido,
                    telefono
                ];
                console.log(arr.length);
                console.log(this.getView().getModel("datosPersonales"));
                return arr;
            } else {
                sap.m.MessageToast.show("Porfavor rellena todos los campos de Datos Personales");
                var arr = [];
                return arr;
            }

        },
        _setProfile: function (arr) {

            if (arr.length < 1)
                return false;

            var nombre = arr[0];
            var apellido = arr[1];
            var telefono = arr[2];

            var model = this.getView().getModel("datosPersonales");

            model.setProperty("/profile/nombre", nombre);
            model.setProperty("/profile/apellido", apellido);
            model.setProperty("/profile/telefono", telefono);
            console.log(model);
            return true;
        },

        _getContact: function () {

            var core = sap.ui.getCore();

            var tipoPago = core.byId($(".tipoPago")[$(".tipoPago").length - 1].id).getSelectedButton().getText();
            var entrega = core.byId($(".entrega")[$(".entrega").length - 1].id).getSelectedButton().getText();
            var hora = core.byId($(".hora")[$(".hora").length - 1].id);

            var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                pattern: "kk:mm:ss"
            });
            var timeStr = timeFormat.format(hora.getDateValue());

            if (hora.getValue() != "") {
                if (core.byId($(".domicilio")[$(".domicilio").length - 1].id).getSelected()) {

                    var localidad = core.byId($(".localidad")[$(".localidad").length - 1].id);
                    var comboVia = core.byId($(".comboVia")[$(".comboVia").length - 1].id).getSelectedItem();
                    var nPiso = core.byId($(".nPiso")[$(".nPiso").length - 1].id);
                    var direccion = core.byId($(".direccion")[$(".direccion").length - 1].id);

                    if (localidad != undefined && comboVia != undefined && nPiso != undefined && direccion != undefined) {
                        var arr = [
                            localidad.getValue(),
                            comboVia.getText(),
                            nPiso.getValue(),
                            direccion.getValue(),
                            tipoPago,
                            entrega,
                            timeStr
                        ];
                        return arr;
                    } else {
                        sap.m.MessageToast.show("Porfavor rellena todos los campos");
                    }
                } else {
                    var arr = [
                        "Madrid",
                        "Calle",
                        "15-17",
                        "Manuel Noya",
                        tipoPago,
                        entrega,
                        timeStr
                    ];
                    return arr;
                }
            } else {
                sap.m.MessageToast.show("Porfavor selecciona una hora");
            }
        },
        _setContact: function (arr) {

            if (arr.length < 1)
                return false;

            var localidad = arr[0];
            var comboVia  = arr[1];
            var nPiso     = arr[2];
            var direccion = arr[3];
            var tipoPago  = arr[4];
            var entrega   = arr[5];
            var hora      = arr[6];

            var model = this.getView().getModel("datosPersonales");

            model.setProperty("/data/localidad", localidad);
            model.setProperty("/data/via", comboVia);
            model.setProperty("/data/piso", nPiso);
            model.setProperty("/data/direccion", direccion);
            model.setProperty("/data/metodoDePago", tipoPago);
            model.setProperty("/data/entrega", entrega);
            model.setProperty("/data/hora", hora);
            console.log(model);
            return true;
        },
        _addPizza: function (oEvent, setproperty, originalproperty) {
            var toppings = [];
            var core = sap.ui.getCore();
            var model = oEvent.getSource().getModel("pedidosPizza");
            var pizzas = core.byId($(".pizzas")[$(".pizzas").length - 1].id).getSelectedItem().getText();

            if (this._comprobateAniadir()) {
                var base = core.byId($(".base")[$(".base").length - 1].id).getSelectedItem().getText();
                var arrToppings = core.byId($(".toppings")[$(".toppings").length - 1].id).getSelectedItems();

                for (var i = 0; i < arrToppings.length; i++)
                    toppings[i] = arrToppings[i].getText();

                if (setproperty === "/") {
                    model.setProperty(setproperty, model.getProperty(originalproperty).concat({
                        pizzaName: pizzas,
                        base: base,
                        toppings: toppings,
                    }));
                } else {
                    model.setProperty(setproperty, {
                        pizzaName: pizzas,
                        base: base,
                        toppings: toppings,
                    });
                }
            } else {

                if (setproperty === "/") {
                    var pathPizza = oEvent.getSource().getParent().getParent().getParent().getParent().getContent()[5].getContent()[0].getItems()[0].getContent()[1].getSelectedItem().getBindingContext("optionPizza").getPath()
                    var pizza = this.getView().getModel("optionPizza").getProperty(pathPizza);
                    var base = pizza.base;

                    model.setProperty(setproperty, model.getProperty(originalproperty).concat({
                        pizzaName: pizzas,
                        base: base,
                        toppings: pizza.toppings
                    }));
                } else {
                    var pathPizza = oEvent.getSource().getParent().getParent().getParent().getParent().getContent()[0].getContent()[0]
                        .getItems()[0].getContent()[1].getSelectedItem().getBindingContext("optionPizza").getPath();
                    var pizza = this.getView().getModel("optionPizza").getProperty(pathPizza);
                    var base = pizza.base;

                    model.setProperty(setproperty, {
                        pizzaName: pizzas,
                        base: base,
                        toppings: pizza.toppings
                    });
                }
            }
            sap.m.MessageToast.show("Acabas de añadir una pizza");
        },
        formatterSmartTopping: function (sVal) {
            if (sVal !== null) {
                var value = sVal.join(', ');
                value += ".";
                return value;
            } else {
                return "El formatter ha fallado";
            }
        },
        _openDialog: function (functionAccepted, functionRefuse) {
            var dialog = new sap.m.Dialog({
                title: 'Confirm',
                type: 'Message',
                content: new sap.m.Text({
                    text: 'Are you sure you want to submit your shopping cart?'
                }),
                beginButton: new sap.m.Button({
                    text: 'Submit',
                    press: function () {
                        sap.m.MessageToast.show('Submit pressed!');
                        dialogConfirm = 1;
                        dialog.close();
                    }
                }),
                endButton: new sap.m.Button({
                    text: 'Cancel',
                    press: function () {
                        dialogConfirm = 0;
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                },
                afterOpen: function () {

                }
            });
            dialog.open();
        },
        _changeArrowListPosition: function (isVisible, oEvent, iconTrue, iconFalse) {
            if (isVisible)
                oEvent.getSource().getContent()[0].getContent()[0].getContent()[0].setSrc(iconTrue);
            else
                oEvent.getSource().getContent()[0].getContent()[0].getContent()[0].setSrc(iconFalse);
        },
        _comprobateAniadir: function () {
            var check = sap.ui.getCore().byId($(".aniadir")[$(".aniadir").length - 1].id);
            if (check.getSelected())
                return true;
            else
                return false;
        },
        _toggleButtonsAndView: function (bEdit) {
            var oView = this.getView();
            oView.byId("edit").setVisible(bEdit);
            oView.byId("save").setVisible(!bEdit);
            oView.byId("cancel").setVisible(!bEdit);
            this._showFormFragment(bEdit ? "untitled.view.display" : "untitled.view.change");
        },
        _getFormFragment: function (sFragmentName) {
            var oFormFragment = this._formFragments[sFragmentName];

            if (oFormFragment) {
                return oFormFragment;
            }

            oFormFragment = sap.ui.xmlfragment(sFragmentName, this);
            this._formFragments[sFragmentName] = oFormFragment;
            return this._formFragments[sFragmentName];
        },
        _showFormFragment: function (sFragmentName) {
            var oPage = this.byId("page");

            oPage.removeAllContent();
            oPage.insertContent(this._getFormFragment(sFragmentName));
        }
    });
});