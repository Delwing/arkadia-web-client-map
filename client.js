var Client = {
        socket: null,
        params: null,
        read_inflator: new pako.Inflate(),
        failed_connections: 0,
        once_connected: !1,
        keepalive_timeout: null,
        msg_buffer: [],
        options: { echo: !0, gmcp: !0, mccp: !1, debug: !1 },
        send: function (e) {
            return !(null == Client.socket || 1 != Client.socket.readyState || "string" != typeof e || !e.length || (Client.socket.send(btoa(e)), 0));
        },
        read: function (e, a, t) {
            if (null == Client.socket || 1 != Client.socket.readyState) return !1;
            if ("string" != typeof e || !e.length) return !1;
            if ((Client.keepalive_timeout && (clearTimeout(Client.keepalive_timeout), (Client.keepalive_timeout = null)), t && Client.options.mccp)) {
                Client.read_inflator.push(
                    e.split("").map(function (e) {
                        return e.charCodeAt(0);
                    }),
                    2
                );
                var o = new Uint16Array(Client.read_inflator.result),
                    n = o.length;
                e = "";
                for (var i = 0; i < n; i++) e += String.fromCharCode(o[i]);
            }
            return e.replace(new RegExp("\\u00FF\\u00FA.*?\\u00FF\\u00F0|\\u00FF.[^\\u00FF]", "g"), Gmcp.parse_option), Output.flush_buffer(), !0;
        },
        check_connection: function () {
            if (null == Client.socket) return !1;
            Client.keepalive_timeout ||
            (Gmcp.send("core.ping"),
                (Client.keepalive_timeout = setTimeout(function () {
                    clearTimeout(Client.keepalive_timeout), Client.disconnect();
                }, 3e3)));
        },
        toggle_connection: function () {
            Client.disconnect() || Client.connect();
        },
        disconnect: function (e) {
            if (null == Client.socket) return !1;
            if (($("#topmenu_connect").html("PoĹÄcz"), $("#topmenu_connect").addClass("k-state-selected"), $("html").hasClass("login"))) {
                if (!$("#shutdown_body").is(":visible"))
                    if (!e && $("#connecting_body").is(":visible")) {
                        if (++Client.failed_connections < 3) return (Client.socket = null), Client.connect(), !0;
                        $(".connect_window_body").hide(), $("#failed_connection_body").show();
                    } else $(".login_window").hide(), $(".connect_window_body").hide(), $("#no_connection_body").show(), $("#connect_window").show();
                $("#intro_dialog").data("kendoWindow").close(), $("#notification_login").data("kendoNotification").getNotifications().parent().remove();
            } else if ($("html").hasClass("account"))
                $("html").addClass("login").removeClass("account"),
                    (Account.data = {}),
                    $(".login_window").hide(),
                    $(".connect_window_body").hide(),
                    $("#no_connection_body").show(),
                    $("#connect_window").show(),
                    $("#notification_account").data("kendoNotification").getNotifications().parent().remove();
            else if ($("html").hasClass("game")) {
                var a = Text.style_system("PoĹÄczenie zostaĹo przerwane.");
                Output.send(a),
                    Logs.send(!0),
                    Maps.unset_position(),
                    $("#popup_panel_chars").closest(".k-animation-container").hide(),
                    $(".login_window").hide(),
                    $(".connect_window_body").hide(),
                    $("#no_connection_body").show(),
                    $("#connect_window").show(),
                $("html").hasClass("topmenu_hidden") && ($("html").removeClass("topmenu_hidden"), Client.resize());
            }
            return $(".account_window .k-textbox, .login_window .k-textbox").val(""), delete Client.socket.onclose, Client.socket.close(), (Client.socket = null), !0;
        },
        connect: function () {
            return !(
                null != Client.socket ||
                ($("html").hasClass("websocket")
                    ? $("html").hasClass("version_update")
                        ? ($(".connect_window_body").hide(), $("#version_update_body").show(), $("#connect_window").show(), 1)
                        : ($("#topmenu_connect").html("ĹÄczenie"),
                            $("#topmenu_connect").removeClass("k-state-selected"),
                            $(".connect_window_body").hide(),
                            $(".login_window").hide(),
                            $("#connecting_body").show(),
                            $("#connect_window").show(),
                            $("html").addClass("login").removeClass("game").removeClass("account"),
                            Client.once_connected
                                ? ($("html").hasClass("game") && $("#topmenu").data("kendoToolBar").hide("#topmenu_conf"),
                                    $(".dialog_window").each(function () {
                                        $(this).data("kendoWindow").close();
                                    }),
                                    $("#notification_login").data("kendoNotification").getNotifications().parent().remove(),
                                    $("#notification_account").data("kendoNotification").getNotifications().parent().remove(),
                                    $("#notification_game").data("kendoNotification").getNotifications().parent().remove(),
                                    document.location.reload(!0),
                                    0)
                                : ((Client.socket = new WebSocket("wss://arkadia.rpg.pl/wss")),
                                    (Client.socket.onopen = function () {
                                        $("#topmenu_connect").html("RozĹÄcz"), (Client.failed_connections = 0), (Client.once_connected = !0);
                                    }),
                                    (Client.socket.onmessage = function (e) {
                                        Client.read(atob(e.data), null, !0);
                                    }),
                                    (Client.socket.onclose = function (e) {
                                        Client.disconnect();
                                    }),
                                    (Client.socket.onerror = function (e) {}),
                                    (window.onbeforeunload = function () {
                                        Client.disconnect();
                                    }),
                                    0))
                    : ($(".connect_window_body").hide(), $("#websocket_body").show(), $("#connect_window").show(), 1))
            );
        },
        resize: function () {
            var e = Output.element,
                a = Input.element;
            if (($(".interface").height($(window).height() - $("#header").outerHeight(!0)), $("html").hasClass("login"))) $("#intro_dialog").data("kendoWindow").center();
            else if ($("html").hasClass("game")) {
                var t = $("#panel_middle").width();
                $("#main_footer").width(t), $("#background_map_output").width($(e).width());
                var o =
                    $("#panel_main").height() -
                    $("#main_footer").outerHeight(!0) -
                    (parseInt($("#panel_progressbars_bottom").css("margin-top")) + parseInt($("#panel_progressbars_top").css("margin-bottom"))) -
                    $("#panel_top").outerHeight(!0) -
                    ($(e).outerHeight(!0) - $(e).height());
                $(e).height(o),
                    $("#background_map_output").height(o),
                    $("#panel_left > div").height($("#panel_left").height()),
                    $("#panel_right > div").height($("#panel_right").height()),
                    Maps.center_background_map(),
                    Scroller.move_down(e),
                    Scroller.move_down(Messages.element),
                    Scroller.move_up(Logs.element),
                    (t += $(a).width() - $(a).outerWidth(!0) - $("#bottommenu .k-overflow-anchor").outerWidth(!0)),
                    $("#bottommenu")
                        .children("[data-overflow='auto']:not(.k-state-hidden)")
                        .each(function () {
                            t > 600 && (t -= $(this).outerWidth(!0));
                        }),
                    $(a).width(t),
                    $("#bottommenu").data("kendoToolBar").resize();
                var n = function (e) {
                    var a = $(e).children(".progressbar:visible"),
                        t = Math.min(200, Math.max(40, $("#main_text_output").width() / (a.length + 1)));
                    t < 100
                        ? $(a).children(".progressbar_text").css("display", "none")
                        : ($(a)
                            .children(".progressbar_text")
                            .css("margin-left", Math.max(0, 120 - t) + "px"),
                            $(a).children(".progressbar_text").css("display", "block")),
                        $(a).width(t);
                };
                n("#panel_progressbars_bottom"), n("#panel_progressbars_top"), Touch.resize(), Game.resize();
            }
            Scroller.move_up(Help_mud.element), Scroller.move_up(Help_client.element), Scroller.move_up(Maps.element);
        },
        set_theme: function (e) {
            if ((e || (e = Storage.read("theme", "") || Conf.defaults.theme_type), e && !$("html").hasClass("theme_" + e))) {
                var a = $("link[href*='kendo.']", document.getElementsByTagName("head")[0]),
                    t = (a.filter("[href*='kendo.common']"), a.filter(":not([href*='kendo.common'])")),
                    o = !1;
                $.each(t, function (a, t) {
                    t.title == e && (o = t);
                }),
                o &&
                ($(t).prop("disabled", !0),
                    $(o).prop("disabled", !1),
                    Storage.send("theme", e),
                    $("html").removeClass(function (e, a) {
                        return (a.match(/(^|\s)theme_\S+/g) || []).join(" ");
                    }),
                    $("html").addClass("theme_" + e));
            }
        },
    },
    Login = {},
    Account = {
        data: {},
        options: {},
        check_name_timeout: null,
        set_adjectives_datasources: function (e) {
            var a,
                t,
                o,
                n,
                i,
                s,
                r = $("#dropdown_set_race").data("kendoDropDownList").value(),
                l = $("#dropdown_set_gender").data("kendoDropDownList").value(),
                d = $("#dropdown_set_first_adjective").data("kendoDropDownList"),
                c = $("#dropdown_set_second_adjective").data("kendoDropDownList");
            (e = e || !1), 0 == l ? (i = Math.pow(2, 2 * r)) : 1 == l && (i = 2 * Math.pow(2, 2 * r));
            var p = jQuery.extend(!0, [], Account.options.attributes);
            (p = $.grep(p, function (e, a) {
                return !!(e.bit & i);
            })),
                (p = $.each(p, function (t, n) {
                    (n.text = Text.capitalize(Text.encode_UTF16(n.text))), 1 == l && (n.text = n.text.slice(0, -1) + "a"), e || (n.val == d.value() && (a = t), n.val == c.value() && (o = t));
                }));
            var _ = jQuery.extend(!0, [], p),
                u = jQuery.extend(!0, [], p);
            for (void 0 === a && (a = Math.floor(Math.random() * _.length)); void 0 === o || a == o; ) o = Math.floor(Math.random() * u.length);
            (t = _[a].val), (n = u[o].val), _.splice(o, 1), u.splice(a, 1);
            var m = new kendo.data.DataSource({
                    data: _,
                    sort: [
                        { field: "group", dir: "asc" },
                        { field: "val", dir: "asc" },
                    ],
                    group: { field: "group" },
                }),
                f = new kendo.data.DataSource({
                    data: u,
                    sort: [
                        { field: "group", dir: "asc" },
                        { field: "val", dir: "asc" },
                    ],
                    group: { field: "group" },
                });
            d.setDataSource(m),
            (s = d.dataSource.filter()) && (d.dataSource.filter(s.filters[0]), d.filterInput.val("")),
                d.value(t),
                c.setDataSource(f),
            (s = c.dataSource.filter()) && (c.dataSource.filter(s.filters[0]), c.filterInput.val("")),
                c.value(n);
        },
        generate_short_instrumental: function (e, a, t, o) {
            if ("string" != typeof e) return "";
            if ("number" != typeof a) return "";
            if ("string" != typeof t) return "";
            if ("string" != typeof o) return "";
            var n = a ? t.slice(0, -1) + "Ä " + o.slice(0, -1) + "Ä" : t + "m " + o + "m";
            switch (e) {
                case "elf":
                    return n + " " + (a ? "elfkÄ" : "elfem");
                case "krasnolud":
                    return n + " " + (a ? "krasnoludkÄ" : "krasnoludem");
                case "halfling":
                    return n + " " + (a ? "halflinkÄ" : "halflingiem");
                case "gnom":
                    return n + " " + (a ? "gnomkÄ" : "gnomem");
                case "ogr":
                    return n + " " + (a ? "ogrzycÄ" : "ogrem");
                default:
                    return n + " " + (a ? "kobietÄ" : "mÄĹźczyznÄ");
            }
        },
        generate_name: function (e) {
            if ("string" != typeof e) return "";
            switch (e) {
                case "elf":
                    var a = new Array(
                            "Aes",
                            "Air",
                            "Al",
                            "Ald",
                            "Am",
                            "Ang",
                            "Cal",
                            "Ca",
                            "Car",
                            "Dol",
                            "Endri",
                            "Eldir",
                            "Eldi",
                            "Ell",
                            "Epon",
                            "Err",
                            "Fann",
                            "Far",
                            "Fil",
                            "Gal",
                            "Gil",
                            "Hal",
                            "Har",
                            "Has",
                            "Ilu",
                            "Imra",
                            "Im",
                            "Io",
                            "Lar",
                            "Laurel",
                            "Laure",
                            "Lin",
                            "Lor",
                            "Loral",
                            "Lora",
                            "Mal",
                            "Mar",
                            "Mor",
                            "Orr",
                            "Pel",
                            "Ral",
                            "Shas",
                            "Sir",
                            "Talla",
                            "Tall",
                            "Ter",
                            "Tor",
                            "Ullia",
                            "Ullial",
                            "Uria",
                            "Urdith",
                            "Val",
                            "Vir",
                            "Yav",
                            "Yava"
                        ),
                        t = new Array(
                            "alion",
                            "andar",
                            "andara",
                            "andil",
                            "andile",
                            "andilas",
                            "andiril",
                            "ane",
                            "anel",
                            "arel",
                            "arr",
                            "avandrel",
                            "cora",
                            "coral",
                            "coran",
                            "coranna",
                            "dil",
                            "drigar",
                            "ellion",
                            "endil",
                            "fan",
                            "fana",
                            "far",
                            "galiel",
                            "gran",
                            "grana",
                            "hal",
                            "hali",
                            "hil",
                            "hile",
                            "holen",
                            "huir",
                            "ia",
                            "ian",
                            "ina",
                            "indel",
                            "irrlan",
                            "lad",
                            "llana",
                            "llanal",
                            "lor",
                            "mal",
                            "maris",
                            "mir",
                            "mor",
                            "nor",
                            "oth",
                            "ras",
                            "riel",
                            "rond",
                            "thin",
                            "thol",
                            "uviel",
                            "wen",
                            "wing"
                        );
                    break;
                case "krasnolud":
                    (a = new Array(
                        "Zig",
                        "Ger",
                        "Gor",
                        "Kha",
                        "Dal",
                        "Del",
                        "Yar",
                        "Pa",
                        "Ka",
                        "Fri",
                        "Ed",
                        "Gr",
                        "Gom",
                        "Bar",
                        "Vo",
                        "Mor",
                        "Ale",
                        "Hol",
                        "Fra",
                        "Ga",
                        "Hein",
                        "Iso",
                        "Alf",
                        "Bro",
                        "Bel",
                        "Adel",
                        "Ehr",
                        "Mun",
                        "Hun",
                        "Har",
                        "Gum",
                        "Gus",
                        "Gron",
                        "Dwin",
                        "Rha",
                        "Dho",
                        "Leo",
                        "Zor",
                        "Orr",
                        "Ghor"
                    )),
                        (t = new Array(
                            "rin",
                            "grin",
                            "ertz",
                            "vert",
                            "or",
                            "orri",
                            "ril",
                            "na",
                            "rak",
                            "ili",
                            "ar",
                            "unda",
                            "ilda",
                            "tha",
                            "icht",
                            "mar",
                            "rra",
                            "rda",
                            "ann",
                            "kka",
                            "um",
                            "er",
                            "el",
                            "rid",
                            "rl",
                            "ul",
                            "ut",
                            "pen",
                            "tz",
                            "gar",
                            "bar",
                            "rim",
                            "ps",
                            "tha"
                        ));
                    break;
                case "halfling":
                    (a = new Array(
                        "Ing",
                        "Ber",
                        "Bro",
                        "Wil",
                        "Der",
                        "Dri",
                        "Carm",
                        "Fru",
                        "Brun",
                        "Vru",
                        "Us",
                        "Ler",
                        "Ker",
                        "Mer",
                        "Mit",
                        "Ger",
                        "Uhl",
                        "Per",
                        "Gigis",
                        "Vern",
                        "Lui",
                        "Gret",
                        "Nast",
                        "Thy",
                        "Ehrm",
                        "Bern",
                        "Ern",
                        "Fri",
                        "Ren",
                        "Beg",
                        "Bar",
                        "Sig",
                        "Vert",
                        "Alb",
                        "Bor",
                        "Vol",
                        "Hed",
                        "Hard",
                        "Die",
                        "Ott",
                        "Vald",
                        "Hil",
                        "Fra"
                    )),
                        (t = new Array(
                            "ef",
                            "illa",
                            "st",
                            "ia",
                            "helm",
                            "oi",
                            "ui",
                            "hilda",
                            "ion",
                            "son",
                            "mar",
                            "ihi",
                            "er",
                            "tel",
                            "und",
                            "en",
                            "ehr",
                            "ler",
                            "hold",
                            "ann",
                            "ssia",
                            "iki",
                            "ata",
                            "ty",
                            "onia",
                            "rea",
                            "run",
                            "tha",
                            "ica",
                            "rid",
                            "itt",
                            "rin",
                            "wig",
                            "hl",
                            "nz"
                        ));
                    break;
                case "gnom":
                    (a = new Array(
                        "Aar",
                        "An",
                        "Ar",
                        "As",
                        "Co",
                        "Hi",
                        "Han",
                        "Har",
                        "Hel",
                        "Iir",
                        "Ja",
                        "Jan",
                        "Jar",
                        "Ko",
                        "Li",
                        "Mo",
                        "Mar",
                        "Na",
                        "Nik",
                        "Os",
                        "Ol",
                        "Peku",
                        "Ral",
                        "Sam",
                        "San",
                        "Theo",
                        "Ter",
                        "Tom",
                        "Ul",
                        "Val",
                        "Vin",
                        "Slig",
                        "Yal",
                        "Ket",
                        "Bian",
                        "Uhl",
                        "Imr",
                        "Bran",
                        "Brom",
                        "Vim"
                    )),
                        (t = new Array("an", "ar", "ai", "orf", "ei", "oth", "or", "om", "iv", "og", "av", "ik", "sh", "eh", "uz", "uf", "oc", "op", "uy", "uk", "ol", "uh", "ina", "ova", "ina", "ih", "off", "ofa", "od"));
                    break;
                case "ogr":
                    (a = new Array(
                        "Zag",
                        "Er",
                        "Gol",
                        "Gro",
                        "Ar",
                        "Kal",
                        "Atu",
                        "Gra",
                        "Az",
                        "Vro",
                        "Val",
                        "Thum",
                        "Tem",
                        "Bar",
                        "Gwa",
                        "Zho",
                        "Gro",
                        "Abu",
                        "Bal",
                        "Koz",
                        "Com",
                        "Azo",
                        "Ozo",
                        "Bro",
                        "Zeal",
                        "Zar",
                        "Thor",
                        "Gryz",
                        "Ol",
                        "Kva",
                        "Kha",
                        "Aga",
                        "Egza",
                        "Khro"
                    )),
                        (t = new Array(
                            "zag",
                            "um",
                            "bun",
                            "un",
                            "zar",
                            "uun",
                            "bur",
                            "ga",
                            "zur",
                            "wur",
                            "ur",
                            "uz",
                            "kir",
                            "za",
                            "anda",
                            "an",
                            "zan",
                            "him",
                            "hid",
                            "om",
                            "oum",
                            "ber",
                            "ot",
                            "tor",
                            "dor",
                            "ta",
                            "tha",
                            "than",
                            "der",
                            "ghor",
                            "aod",
                            "iza",
                            "hun",
                            "thun",
                            "thum",
                            "uin"
                        ));
                    break;
                default:
                    (a = new Array(
                        "Ab",
                        "Ac",
                        "Ad",
                        "Af",
                        "Agr",
                        "Ast",
                        "As",
                        "Al",
                        "Adw",
                        "Adr",
                        "Ar",
                        "Bo",
                        "Br",
                        "Bon",
                        "Can",
                        "Ced",
                        "Cr",
                        "Ch",
                        "Cad",
                        "Dah",
                        "Dym",
                        "Dra",
                        "Dwi",
                        "Eber",
                        "Ed",
                        "Eth",
                        "Et",
                        "Er",
                        "El",
                        "Eow",
                        "Fal",
                        "Fr",
                        "Ger",
                        "Gr",
                        "Gret",
                        "Gal",
                        "Hod",
                        "Hel",
                        "Her",
                        "Ha",
                        "Ibn",
                        "Jer",
                        "Klar",
                        "Ka",
                        "Kir",
                        "Ked",
                        "Liut",
                        "Loth",
                        "Lar",
                        "Leg",
                        "May",
                        "Mehl",
                        "Mir",
                        "Nath",
                        "Nyd",
                        "Ol",
                        "Oc",
                        "On",
                        "Pav",
                        "Pr",
                        "Raf",
                        "Rh",
                        "Ryd",
                        "Sath",
                        "Sob",
                        "Sev",
                        "Teo",
                        "Tro",
                        "Tha",
                        "Val",
                        "Vayne",
                        "Yen",
                        "Yark",
                        "Zyv",
                        "Uhl",
                        "Wan",
                        "Wic"
                    )),
                        (t = new Array(
                            "gart",
                            "hard",
                            "erad",
                            "enen",
                            "kan",
                            "ed",
                            "id",
                            "ay",
                            "ard",
                            "ian",
                            "il",
                            "emen",
                            "er",
                            "era",
                            "ela",
                            "holt",
                            "enda",
                            "era",
                            "enna",
                            "iss",
                            "ald",
                            "alt",
                            "ira",
                            "ila",
                            "nin",
                            "ik",
                            "nik",
                            "ilia",
                            "rond",
                            "old",
                            "za",
                            "av",
                            "om",
                            "ryk",
                            "es",
                            "os",
                            "iks",
                            "iel"
                        ));
            }
            return a[Math.round(Math.random() * (a.length - 1))] + t[Math.round(Math.random() * (t.length - 1))];
        },
        check_name: function () {
            var e = $("#input_char_name").val();
            $("#notification_name").data("kendoNotification").hide(),
                $("#input_name_nominative").val(e),
                clearTimeout(Account.check_name_timeout),
                (Account.check_name_timeout = null),
            e.length &&
            (Account.check_name_timeout = setTimeout(function () {
                if (e.length)
                    if (e == Text.filter_alphabetic(e)) {
                        var a = {};
                        (a.name = e), Gmcp.send("account.check_name", JSON.stringify(a));
                    } else $("#notification_name").data("kendoNotification").show("ImiÄ zawiera niedozwolone znaki.", "error");
            }, 1e3));
        },
    },
    Game = {
        data: { char: {}, objects: { data: {}, list: [], descs: {} } },
        panel_chars_timeout: null,
        refresh_panel_chars: function () {
            if ($("html").hasClass("conf")) {
                var e,
                    a,
                    t = [],
                    o = $("#listview_panel_chars").data("kendoListView"),
                    n = jQuery.extend(!0, [], Game.data.objects.list),
                    i = 0,
                    s = 1;
                if (
                    ((e = jQuery.extend(!0, [], Conf.options.char_type)).sort(function (e, a) {
                        return e.Color_Order - a.Color_Order;
                    }),
                    2 == Conf.data.panel_chars_order &&
                    n.sort(function (e, a) {
                        return !0 === Game.data.objects.data[e].enemy && !0 !== Game.data.objects.data[a].enemy
                            ? 1
                            : !0 !== Game.data.objects.data[e].enemy && !0 === Game.data.objects.data[a].enemy
                                ? -1
                                : !0 === Game.data.objects.data[e].team && !0 !== Game.data.objects.data[a].team
                                    ? 1
                                    : !0 !== Game.data.objects.data[e].team && !0 === Game.data.objects.data[a].team
                                        ? -1
                                        : void 0;
                    }),
                        $.each(n, function (a, o) {
                            var n = jQuery.extend(!0, {}, Game.data.objects.data[o]);
                            $.isPlainObject(n) &&
                            (n.avatar
                                ? ((n.order = 0),
                                    (n.desc = "Twoja postaÄ"),
                                    (n.id = o),
                                    (n.icons = []),
                                    $.each(e, function (e, a) {
                                        if (!0 === n[a.Id]) {
                                            if (($.isPlainObject(Conf.data.color_codes) && !n.color && (n.color = Conf.data.color_codes.panel_chars[a.Id]), "team" == a.Id && !0 === n.team_leader)) return !0;
                                            n.icons.push({ Css_Icon: a.Css_Icon, Text: a.Text });
                                        }
                                    }),
                                    t.unshift(n))
                                : ((n.order = s),
                                    (n.id = o),
                                    (n.icons = []),
                                !0 !== n.enemy && !0 !== n.team && (n.neutral = !0),
                                    $.each(e, function (e, a) {
                                        if (!0 === n[a.Id]) {
                                            if (
                                                ($.isPlainObject(Conf.data.color_codes) && !n.color && (n.color = Conf.data.color_codes.panel_chars[a.Id]),
                                                ("team" == a.Id && !0 === n.team_leader) || ("enemy" == a.Id && !0 === n.avatar_target))
                                            )
                                                return !0;
                                            n.icons.push({ Css_Icon: a.Css_Icon, Text: a.Text });
                                        }
                                    }),
                                    t.push(n),
                                    s++,
                                "string" == typeof n.desc && (Game.data.objects.descs[o] = n.desc)));
                        }),
                        $("#listview_panel_chars").is(":visible"))
                ) {
                    var r = $("#listview_panel_chars .listview_elem.k-state-focused");
                    r.length && (r = o.dataItem(r)) && (a = r.id), (i = $("#listview_panel_chars").scrollTop());
                }
                if (
                    ((t = new kendo.data.DataSource({ data: t, sort: [{ field: "order", dir: "asc" }] })),
                        o.setDataSource(t),
                        $("#listview_panel_chars").removeClass("listview_scrolled_down"),
                        $("#listview_panel_chars").scrollTop(i),
                        $(".panel_chars_health_bar").each(function () {
                            var e = o.dataItem($(this).closest(".listview_elem")),
                                a = $.isPlainObject(Conf.data.color_codes) ? Conf.data.color_codes.progressbars.kondycja : "transparent";
                            e.old_hp
                                ? ($(this).kendoProgressBar({ showStatus: !1, animation: !1, orientation: "vertical", value: Math.floor((100 * (e.old_hp + 1)) / 7) }),
                                    $(this)
                                        .data("kendoProgressBar")
                                        .setOptions({ animation: { duration: 300 } }),
                                    $(this).data("kendoProgressBar").progressWrapper.css({ "background-color": a, "border-color": a }),
                                    $(this)
                                        .data("kendoProgressBar")
                                        .value(Math.floor((100 * (e.hp + 1)) / 7)),
                                    delete Game.data.objects.data[e.id].old_hp)
                                : ($(this).kendoProgressBar({ showStatus: !1, animation: !1, orientation: "vertical", value: Math.floor((100 * (e.hp + 1)) / 7) }),
                                    $(this)
                                        .data("kendoProgressBar")
                                        .setOptions({ animation: { duration: 300 } }),
                                    $(this).data("kendoProgressBar").progressWrapper.css({ "background-color": a, "border-color": a }));
                        }),
                        a)
                ) {
                    var l = !1;
                    $.each($("#listview_panel_chars div"), function (e, t) {
                        if (o.dataItem($(t)).id == a) return Game.show_actions_menu(t), (l = !0), !1;
                    }),
                    l || ($("#popup_panel_chars").closest(".k-animation-container").hide(), $("#popup_panel_chars > div").children().remove(), $("#listview_panel_chars .listview_elem.k-state-focused").removeClass("k-state-focused"));
                }
            }
        },
        show_actions_menu: function (e) {
            if (null != Client.socket && (e || (e = $("#listview_panel_chars .listview_elem.k-state-focused")), $(e).hasClass("listview_elem"))) {
                var a = $("#listview_panel_chars").data("kendoListView").dataItem(e),
                    t = $("#listview_panel_chars").data("kendoListView").dataSource.data()[0];
                if (
                    ($("#popup_panel_chars").closest(".k-animation-container").hide(),
                        $("#popup_panel_chars > div").children().remove(),
                        $("#listview_panel_chars .listview_elem.k-state-focused").removeClass("k-state-focused"),
                    t &&
                    t.avatar &&
                    ($.each(Conf.data.actions, function (e, o) {
                        var n = o.Char_Type,
                            i = !1;
                        return (
                            n.length
                                ? $.each(Conf.options.char_type, function (e, t) {
                                    if (n.indexOf(t.Id) > -1 && !0 === a[t.Id] && ("avatar" == t.Id || !0 !== a.avatar)) return (i = !0), !1;
                                })
                                : (i = !0),
                            !i ||
                            ((n = o.Team_Role),
                                (i = !1),
                                $.each(Conf.options.team_role, function (e, a) {
                                    if (a.Id == n && !0 === t[a.Id]) return (i = !0), !1;
                                }),
                            !i ||
                            ($("#popup_panel_chars > div").children().length ||
                            ($("<div></div>").appendTo($("#popup_panel_chars > div")).addClass("flex_row").attr("id", "popup_panel_chars_header"),
                                $("<div>" + Text.encode_html(a.order) + "</div>")
                                    .appendTo($("#popup_panel_chars_header"))
                                    .css("background-color", Text.encode_html(a.color))
                                    .addClass("flex_shrink panel_chars_order"),
                                $("#popup_panel_chars_header").on("click", function (e) {
                                    $("#popup_panel_chars").closest(".k-animation-container").hide(),
                                        $("#popup_panel_chars > div").children().remove(),
                                        $("#listview_panel_chars .listview_elem.k-state-focused").removeClass("k-state-focused");
                                })),
                                void $("<input></input>")
                                    .prop("type", "submit")
                                    .prop("value", Text.uppercase(decodeURI(o.Name)))
                                    .appendTo($("#popup_panel_chars > div"))
                                    .attr("id", "panel_chars_button_" + e)
                                    .addClass("flex_shrink")
                                    .addClass("panel_chars_button")
                                    .addClass("button")
                                    .kendoButton()))
                        );
                    }),
                        $(".panel_chars_button").length))
                ) {
                    if (
                        ($(".panel_chars_button").kendoTouch({
                            doubleTapTimeout: 0,
                            tap: function (e) {
                                if ((e.event.preventDefault(), null != Client.socket)) {
                                    var t = $(this.element).attr("id");
                                    if (((t = parseInt(t.substring("panel_chars_button_".length))), !(isNaN(t) || t < 0 || Conf.data.actions.length <= t) && a.id)) {
                                        var o = Conf.data.actions[t].Replacement,
                                            n = Input.check_variables(o);
                                        !1 !== n
                                            ? $.each(n.split(/\n/), function (e, a) {
                                                Input.send(a);
                                            })
                                            : Output.send(Text.style_blocked_command(Text.encode_html(o)), "command");
                                    }
                                }
                            },
                        }),
                            $("#panel_touch #panel_chars").length)
                    )
                        $("#popup_panel_chars")
                            .data("kendoPopup")
                            .setOptions({ anchor: $("#listview_panel_chars"), position: "center left", origin: "center right" });
                    else
                        switch (Conf.data.actions_popup_position) {
                            case 1:
                                $("#popup_panel_chars")
                                    .data("kendoPopup")
                                    .setOptions({ anchor: $("#panel_chars"), position: "center right", origin: "center left" });
                                break;
                            case 2:
                                $("#popup_panel_chars")
                                    .data("kendoPopup")
                                    .setOptions({ anchor: $("#panel_chars"), position: "center left", origin: "center right" });
                                break;
                            case 3:
                                $("#popup_panel_chars")
                                    .data("kendoPopup")
                                    .setOptions({ anchor: $("#panel_chars"), position: "center left", origin: "center left" });
                                break;
                            case 4:
                                $("#popup_panel_chars")
                                    .data("kendoPopup")
                                    .setOptions({ anchor: $("#panel_chars"), position: "center right", origin: "center right" });
                                break;
                            case 5:
                                $("#popup_panel_chars")
                                    .data("kendoPopup")
                                    .setOptions({ anchor: $(e), position: "top center", origin: "bottom center" });
                        }
                    $("#popup_panel_chars").data("kendoPopup").position(), $("#popup_panel_chars").data("kendoPopup").open(), $("#popup_panel_chars").closest(".k-animation-container").show(), $(e).addClass("k-state-focused");
                }
            }
        },
        generate_panel_chars_template: function (e) {
            var a,
                t = $("#panel_left #panel_chars").length ? "flex_row_reverse" : "flex_row",
                o = '<div class="panel_chars_enemies flex_expand flex_row">',
                n = Text.uppercase(Text.encode_html(e.desc));
            if (
                ($.each($("#listview_panel_chars").data("kendoListView").dataSource.data(), function (a, t) {
                    t.attack_num === e.id && (o += '<div title="AtakujÄcy" class="panel_chars_enemy flex_shrink" style="background-color:' + Text.encode_html(t.color) + '">' + Text.encode_html(t.order) + "</div>");
                }),
                    (o += "</div>"),
                    (a =
                        '<div class="panel_chars_icons flex_shrink">' +
                        e.icons
                            .map(function (e) {
                                return '<span title="' + e.Text + '" class="fa ' + Text.encode_html(e.Css_Icon) + '"></span>';
                            })
                            .join("") +
                        "</div>"),
                e.avatar || !e.desc)
            )
                n = "<span><br>" + n + "</span>";
            else {
                var i = n.split(" ");
                n = '<span class="panel_chars_adjs">' + i.splice(0, Math.min(2, i.length - 1)).join(" ") + "</span><span><br>" + i.join(" ") + "</span>";
            }
            return (
                '<div class="listview_elem k-widget ' +
                t +
                '"><div title="Kondycja" class="panel_chars_health_bar progressbar"></div><div class="flex_expand flex_column"><div class="flex_shrink ' +
                t +
                '"><div title="Numer postaci" class="panel_chars_order flex_shrink" style="background-color:' +
                Text.encode_html(e.color) +
                '">' +
                Text.encode_html(e.order) +
                '</div><div class="flex_expand flex_column"><div title="ImiÄ lub opis postaci" class="panel_chars_desc flex_shrink">' +
                n +
                '</div></div></div><div class="flex_expand ' +
                t +
                '">' +
                a +
                o +
                "</div></div></div>"
            );
        },
        resize: function () {
            $("#panel_chars").is(":visible")
                ? $("#listview_panel_chars").height($("#panel_chars").height() - parseInt($("#listview_panel_chars").css("border-bottom-width")) - parseInt($("#listview_panel_chars").css("border-top-width")))
                : ($("#popup_panel_chars").closest(".k-animation-container").hide(), $("#popup_panel_chars > div").children().remove(), $("#listview_panel_chars .listview_elem.k-state-focused").removeClass("k-state-focused"));
        },
    },
    Input = {
        element: null,
        history: [],
        prefix_history: [],
        index: -1,
        prefix: "",
        send: function (e) {
            if ("string" != typeof e) return !1;
            if (Client.send(e + String.fromCharCode(13) + String.fromCharCode(10))) {
                if (!0 === Client.options.echo) {
                    var a = Text.style_command(Text.encode_html(e));
                    Output.send(a, "command");
                }
                return $("html").hasClass("mobile-small") && !$("html").hasClass("topmenu_hidden") && ($("html").addClass("topmenu_hidden"), Client.resize()), !0;
            }
        },
        history_up: function () {
            var e = Input.element;
            if (
                (parseInt(Conf.data.history_limit || 20),
                "" != Input.prefix &&
                Input.index > -1 &&
                (e.value.substring(0, Input.prefix.length) != Input.prefix || e.selectionEnd != e.value.length || e.selectionStart != Input.prefix.length) &&
                ((Input.prefix = e.value), (Input.index = -1)),
                -1 == Input.index)
            ) {
                var a;
                if ((a = e.selectionEnd == e.value.length ? e.value.substring(0, e.selectionStart) : e.value).length) {
                    var t = Input.history.concat(Conf.data.extra_history || []);
                    (Input.prefix_history = $.grep(t, function (e) {
                        return e.substring(0, a.length) == a;
                    }).filter(function (e, a, t) {
                        return t.indexOf(e) == a;
                    })),
                    e.value == Input.prefix_history[0] && Input.prefix_history.shift(),
                        Input.prefix_history.length ? (Input.prefix = a) : ((Input.prefix = ""), (Input.prefix_history = jQuery.extend(!0, [], Input.history)));
                } else (Input.prefix = ""), (Input.prefix_history = jQuery.extend(!0, [], Input.history));
                e.value == Input.prefix_history[0] && Input.prefix_history.shift();
            }
            var o = Input.prefix_history[Input.index + 1];
            void 0 !== o && (Input.index++, (e.value = o), Input.set_color(), "" == Input.prefix ? e.setSelectionRange(o.length, o.length) : e.setSelectionRange(Input.prefix.length, o.length));
        },
        history_down: function () {
            var e = Input.element;
            if (Input.index <= 0 || ("" != Input.prefix && Input.index > -1 && (e.value.substring(0, Input.prefix.length) != Input.prefix || e.selectionEnd != e.value.length || e.selectionStart != Input.prefix.length)))
                (Input.index = -1), (Input.prefix = ""), (e.value = ""), (e.style.color = "#FFF");
            else {
                Input.index--;
                var a = Input.prefix_history[Input.index];
                (e.value = a), Input.set_color(), "" == Input.prefix ? e.setSelectionRange(a.length, a.length) : e.setSelectionRange(Input.prefix.length, a.length);
            }
        },
        process_command: function (e) {
            var a = Input.element,
                t = parseInt(Conf.data.history_limit || 20);
            e || (e = a.value),
            e != Input.history[0] && "" != e && !0 === Client.options.echo && (Input.history.unshift(e), (Input.history = Input.history.slice(0, t))),
                !0 === Client.options.echo && 1 == Conf.data.input_echo && "readonly" !== $(a).attr("readonly") && !0 !== $(a).attr("readonly") ? ((a.value = e), a.setSelectionRange(0, e.length)) : (a.value = ""),
                Scroller.move_down(Output.element),
                Input.set_color(),
                (Input.index = -1),
                (Input.prefix = "");
        },
        process_input: function () {
            var e,
                a = Input.element;
            null != Client.socket && 1 == Client.socket.readyState
                ? ((e = Conf.data.input_split ? new RegExp(String.fromCharCode(8629) + "|\\" + String.fromCharCode(Conf.data.input_split), "g") : new RegExp(String.fromCharCode(8629), "g")),
                    $.each(a.value.split(e), function (e, a) {
                        var t,
                            o,
                            n = Text.filter_alphanumeric(a);
                        $("html").hasClass("aliases") && $.isPlainObject(Conf.data.aliases) && (t = Conf.data.aliases[n.split(" ")[0]])
                            ? !1 !== (o = Input.check_variables(t))
                                ? $.each(o.split(/\n/), function (e, a) {
                                    Input.send(a);
                                })
                                : $.each(t.split(/\n/), function (e, a) {
                                    Output.send(Text.style_blocked_command(Text.encode_html(a)), "command");
                                })
                            : Conf.data.input_variables
                                ? !1 !== (o = Input.check_variables(n))
                                    ? Input.send(o)
                                    : Output.send(Text.style_blocked_command(Text.encode_html(n)), "command")
                                : Input.send(n);
                    }),
                    Input.process_command())
                : (a.value = "");
        },
        check_variables: function (e, a) {
            var t,
                o,
                n,
                i,
                s,
                r = [];
            a ? (t = a[0]) : ((t = Text.filter_alphanumeric(Input.element.value)), (o = !1));
            var l,
                d = t.replace(/\s\s+/g, " ").split(" ");
            if (e.indexOf("%") > -1) {
                for (n = new RegExp("%%"), i = 0; (s = n.exec(e.substring(i))); ) {
                    if (Conf.data.blocking_variables && !t && !a) return !1;
                    r.push({ start: i + s.index, end: i + s.index + s[0].length, replacement: t || "" }), (i += s.index + s[0].length), !1 === o && (o = !0);
                }
                for (n = new RegExp("%(-|)\\d+"), i = 0; (s = n.exec(e.substring(i))); )
                    if ((l = parseInt(s[0].substring(1))) < 0) {
                        if (((l *= -1), Conf.data.blocking_variables && d.length <= l && !a)) return !1;
                        for (var c = t, p = 0; p < l; ) {
                            var _ = c.indexOf(d[p]) + d[p].length;
                            (c = c.substring(_)), p++;
                        }
                        if (((c = c.replace(/^\s+/g, "")), Conf.data.blocking_variables && !c && !a)) return !1;
                        r.push({ start: i + s.index, end: i + s.index + s[0].length, replacement: c || "" }), (i += s.index + s[0].length), !1 === o && (o = !0);
                    } else {
                        if (Conf.data.blocking_variables && !d[l] && !a) return !1;
                        r.push({ start: i + s.index, end: i + s.index + s[0].length, replacement: d[l] || "" }), (i += s.index + s[0].length), !1 === o && (o = !0);
                    }
            }
            if (e.indexOf("$") > -1)
                if (a) {
                    for (n = new RegExp("\\$\\$"), i = 0; (s = n.exec(e.substring(i))); ) r.push({ start: i + s.index, end: i + s.index + s[0].length, replacement: a.input || "" }), (i += s.index + s[0].length);
                    for (n = new RegExp("\\$\\d+"), i = 0; (s = n.exec(e.substring(i))); )
                        (l = parseInt(s[0].substring(1))) >= 0 && (r.push({ start: i + s.index, end: i + s.index + s[0].length, replacement: a[l + 1] || "" }), (i += s.index + s[0].length));
                } else {
                    for (u = $("#listview_panel_chars").data("kendoListView").dataSource.data(), n = new RegExp("\\$\\$"), i = 0; (s = n.exec(e.substring(i))); ) {
                        if (((l = $("#listview_panel_chars .listview_elem.k-state-focused").index()), Conf.data.blocking_variables && !u[l])) return !1;
                        r.push({ start: i + s.index, end: i + s.index + s[0].length, replacement: (u[l].avatar ? "siebie" : "ob_" + u[l].id) || "" }), (i += s.index + s[0].length);
                    }
                    for (n = new RegExp("\\$\\d+"), i = 0; (s = n.exec(e.substring(i))); )
                        if ((l = parseInt(s[0].substring(1))) >= 0) {
                            if (Conf.data.blocking_variables && !u[l]) return !1;
                            r.push({ start: i + s.index, end: i + s.index + s[0].length, replacement: (u[l].avatar ? "siebie" : "ob_" + u[l].id) || "" }), (i += s.index + s[0].length);
                        }
                }
            if (!(i = r.length)) return e;
            for (
                r.sort(function (e, a) {
                    return e.end < a.end ? -1 : e.end > a.end ? 1 : 0;
                });
                i--;

            ) {
                var u = r[i];
                e = e.substring(0, u.start) + u.replacement + e.substring(u.end);
            }
            return !0 === o && Input.process_command(t), e;
        },
        set_color: function () {
            var e = Input.element;
            e.value.length > 80 ? (e.style.color = "#999") : (e.style.color = "#FFF");
        },
    },
    Touch = {
        element: null,
        index: -1,
        keyboard: {
            lower: [
                ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
                ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
                ["upper", "z", "x", "c", "v", "b", "n", "m", "backspace"],
                ["numeric", "space", "return"],
            ],
            upper: [
                ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
                ["lower", "Z", "X", "C", "V", "B", "N", "M", "backspace"],
                ["numeric", "space", "return"],
            ],
            numeric: [
                ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
                ["+", "-", "*", "/", "=", ":", ";", "(", ")"],
                ["special", ".", ",", "?", "!", "'", '"', "~", "backspace"],
                ["lower", "space", "return"],
            ],
            special: [
                ["[", "]", "{", "}", "(", ")", "#", "%", "^", "*"],
                ["_", "`", "|", "<", ">", "$", "&", "@", "\\"],
                ["numeric", ".", ",", "?", "!", "'", '"', "~", "backspace"],
                ["lower", "space", "return"],
            ],
        },
        generate_keyboard: function () {
            $.each(Object.keys(Touch.keyboard), function (e, a) {
                var t = $("<div></div>")
                    .addClass("keyboard_type")
                    .attr("id", "keyboard_" + a);
                $.each(Touch.keyboard[a], function (e, o) {
                    var n = $("<div></div>")
                        .addClass("keyboard_row")
                        .addClass("keyboard_row_" + (e + 1));
                    $.each(Touch.keyboard[a][e], function (e, a) {
                        var t,
                            o = $("<div></div>").addClass("keyboard_button_wrapper").appendTo(n),
                            i = $("<button></button>").prop("type", "submit").prop("value", a).appendTo(o).addClass("keyboard_button").addClass("button").kendoButton().removeAttr("tabindex");
                        switch (a) {
                            case "return":
                                (t = "<span class='fa fa-level-up fa-rotate-90'></span>"), i.addClass("keyboard_button_return");
                                break;
                            case "space":
                                (t = "spacja"), i.addClass("keyboard_button_space");
                                break;
                            case "backspace":
                                (t = "<span class='fa fa-long-arrow-left'></span>"), i.addClass("keyboard_button_backspace");
                                break;
                            case "lower":
                                (t = "abc"), i.addClass("keyboard_button_lower");
                                break;
                            case "upper":
                                (t = "ABC"), i.addClass("keyboard_button_upper");
                                break;
                            case "numeric":
                                (t = "123"), i.addClass("keyboard_button_numeric");
                                break;
                            case "special":
                                (t = "#$@"), i.addClass("keyboard_button_special");
                                break;
                            default:
                                (t = a), i.addClass("keyboard_button_character");
                        }
                        i.html(t);
                    }),
                        n.appendTo(t);
                }),
                    t.appendTo($("#keyboard"));
            }),
                $(".keyboard_button_wrapper").on("touchstart", function (e) {
                    var a = $(e.target);
                    (a = a.hasClass("keyboard_button_wrapper") ? a.find(".keyboard_button") : a.closest(".keyboard_button_wrapper").find(".keyboard_button")).length && a.addClass("k-state-focused");
                }),
                $(".keyboard_button_wrapper").on("touchend", function (e) {
                    var a = $(e.target);
                    (a = a.hasClass("keyboard_button_wrapper") ? a.find(".keyboard_button") : a.closest(".keyboard_button_wrapper").find(".keyboard_button")).length && a.removeClass("k-state-focused");
                }),
                $(".keyboard_button_wrapper").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        if ((e.event.preventDefault(), null != Client.socket)) {
                            var a,
                                t = Input.element,
                                o = $(this.element);
                            if ((o = o.hasClass("keyboard_button_wrapper") ? o.find(".keyboard_button") : o.closest(".keyboard_button_wrapper").find(".keyboard_button")).length && (a = o.prop("value")))
                                switch (a) {
                                    case "return":
                                        Input.process_input(),
                                            $("html").removeClass(function (e, a) {
                                                return (a.match(/(^|\s)keyboard_\S+/g) || []).join(" ");
                                            }),
                                            $("html").addClass("keyboard_lower");
                                        break;
                                    case "space":
                                        (t.value += " "), t.setSelectionRange(t.value.length, t.value.length), (t.scrollTop = t.scrollHeight);
                                        break;
                                    case "backspace":
                                        (t.value = t.value.substring(0, t.value.length - 1)), t.setSelectionRange(t.value.length, t.value.length), (t.scrollTop = t.scrollHeight);
                                        break;
                                    case "lower":
                                        $("html").removeClass(function (e, a) {
                                            return (a.match(/(^|\s)keyboard_\S+/g) || []).join(" ");
                                        }),
                                            $("html").addClass("keyboard_lower");
                                        break;
                                    case "upper":
                                        $("html").removeClass(function (e, a) {
                                            return (a.match(/(^|\s)keyboard_\S+/g) || []).join(" ");
                                        }),
                                            $("html").addClass("keyboard_upper");
                                        break;
                                    case "numeric":
                                        $("html").removeClass(function (e, a) {
                                            return (a.match(/(^|\s)keyboard_\S+/g) || []).join(" ");
                                        }),
                                            $("html").addClass("keyboard_numeric");
                                        break;
                                    case "special":
                                        $("html").removeClass(function (e, a) {
                                            return (a.match(/(^|\s)keyboard_\S+/g) || []).join(" ");
                                        }),
                                            $("html").addClass("keyboard_special");
                                        break;
                                    default:
                                        (t.value += a),
                                            t.setSelectionRange(t.value.length, t.value.length),
                                            (t.scrollTop = t.scrollHeight),
                                        $("html").hasClass("keyboard_upper") &&
                                        ($("html").removeClass(function (e, a) {
                                            return (a.match(/(^|\s)keyboard_\S+/g) || []).join(" ");
                                        }),
                                            $("html").addClass("keyboard_lower"));
                                }
                        }
                    },
                    minHold: 500,
                    hold: function (e) {
                        if ((e.event.preventDefault(), null != Client.socket)) {
                            var a = Input.element,
                                t = $(this.element);
                            (t = t.hasClass("keyboard_button_wrapper") ? t.find(".keyboard_button") : t.closest(".keyboard_button_wrapper").find(".keyboard_button")).length &&
                            "backspace" == t.prop("value") &&
                            ((a.value = a.value.substring(0, Math.max(0, a.value.lastIndexOf(" ")) + 1)), a.setSelectionRange(a.value.length, a.value.length));
                        }
                    },
                });
        },
        refresh: function (e) {
            if (
                ((e = e || 1),
                    $("html").removeClass(function (e, a) {
                        return (a.match(/(^|\s)panel_touch_\S+/g) || []).join(" ");
                    }),
                    $("#directions_touch").children().appendTo($("#panel_hidden")),
                    $("#panel_touch").children().appendTo($("#panel_hidden")),
                    Conf.data.touch_panels.length)
            ) {
                (Touch.index < 0 || Touch.index >= Conf.data.touch_panels.length) && (Touch.index = 0);
                for (var a = Touch.index; ; ) {
                    var t = Conf.data.touch_panels[Touch.index];
                    switch (t) {
                        case "keyboard":
                            $("#keyboard").appendTo($("#panel_touch")),
                                $("html").removeClass(function (e, a) {
                                    return (a.match(/(^|\s)keyboard_\S+/g) || []).join(" ");
                                }),
                                $("html").addClass("keyboard_lower");
                            break;
                        case "directions":
                            $("#directions").is(":visible") ||
                            ($("#directions_touch").appendTo($("#panel_touch")), $("#minimap_output").is(":visible") || $("#minimap_output").appendTo($("#directions_touch")), $("#directions").appendTo($("#directions_touch")));
                            break;
                        case "chars":
                            $("#panel_chars").is(":visible") || ($("#panel_chars").appendTo($("#panel_touch")), $("#listview_panel_chars").data("kendoListView").dataSource.read(), Game.refresh_panel_chars());
                            break;
                        case "status":
                            $(".progressbar.panel_elem").filter(":not(:visible)").appendTo($("#panel_touch"));
                            break;
                        case "buttons":
                            $(".panel_button").filter(":not(:visible)").appendTo($("#panel_touch"));
                    }
                    if ($(Touch.element).children().length) return $("html").addClass("panel_touch_" + t), $("#panel_touch").scrollTop(0), void ("directions" == t && Maps.center_minimap());
                    if ((Touch.shift(e), Touch.index == a)) return void (Touch.index = -1);
                }
            } else Touch.index = -1;
        },
        shift: function (e) {
            (e = e || 1) > 0 ? (Touch.index >= Conf.data.touch_panels.length - 1 ? (Touch.index = 0) : Touch.index++) : e < 0 && (Touch.index ? Touch.index-- : (Touch.index = Conf.data.touch_panels.length - 1));
        },
        resize: function () {
            if ($("#panel_touch").is(":visible")) {
                if ($("html").hasClass("panel_touch_directions")) {
                    var e = Math.min($("#panel_touch").width() / $("#panel_touch #directions_touch").width(), $("#panel_touch").height() / $("#panel_touch #directions_touch").height());
                    $("#panel_touch #directions_touch").css("transform", "scale(" + e + ", " + e + ")");
                }
                if (($("html").hasClass("panel_touch_chars") && $("#panel_chars").css("margin-left", -1 * Math.min($("#panel_touch").width() - $("#panel_chars").width() - 10, 100) + "px"), $("html").hasClass("panel_touch_keyboard"))) {
                    var a = $("#panel_touch").width() / $("#keyboard").width(),
                        t = $("#panel_touch").height() / $("#keyboard").height();
                    $("#panel_touch #keyboard").css("transform", "scale(" + a + ", " + t + ")");
                }
            }
        },
    },
    Output = {
        element: null,
        index: 0,
        buffer: [],
        flush_buffer: function () {
            Output.buffer.length &&
            $("html").hasClass("conf") &&
            ($.each(Output.buffer, function (e, a) {
                (a.text = Text.encode_html(a.text)), (a.text = Text.parse_patterns(a.text));
            }),
                Output.send());
        },
        send: function (e, a) {
            if ("string" == typeof e && e.length) {
                var t = {};
                (t.text = e), (t.type = a || "other"), Output.buffer.push(t);
            }
            if (!$("html").hasClass("conf")) return !0;
            var o = Messages.element,
                n = Scroller.check_down(s),
                i = Scroller.check_down(o),
                s = Output.element,
                r = "<div class='output_msg_time'>" + Text.style_system(kendo.toString(new Date(), "HH:mm:ss.fff")) + "</div>",
                l = parseInt(Conf.data.output_limit || 50);
            (e = ""),
                $.each(Output.buffer, function (a, t) {
                    "&gt; " == t.text && "other" == t.type
                        ? ((t.text = r + "<div class='output_msg_text'>" + t.text + "</div>"),
                            $("#main_text_output_msg_wrapper .output_msg").last().hasClass("output_msg_command")
                                ? (t.type = "output_msg")
                                : (t.type = $("#main_text_output_msg_wrapper .output_msg").last().attr("class") + " output_msg_hidden_time"),
                            (e += "<div class='" + t.type + "'>" + t.text + "</div>"))
                        : ((t.text = r + "<div class='output_msg_text'>" + t.text + "</div>"),
                            "string" == typeof t.type && t.type.length
                                ? ((t.type = t.type.replace(".", "_").replace(" ", "_")),
                                    (t.text = "<div class='output_msg output_msg_" + t.type + "'>" + t.text + "</div>"),
                                    $("html").hasClass("messages_type_" + t.type)
                                        ? ($("#messages_output_msg_wrapper").children().slice(0, -l).remove(),
                                            i ? ($("#messages_output_msg_wrapper").append(t.text), Scroller.refresh(o), Scroller.move_down(o)) : ($("#messages_output_msg_wrapper").append(t.text), $(o).addClass("k-state-selected")),
                                        $("#messages_dialog").data("kendoWindow").options.isMinimized &&
                                        ($(".messages_title_" + t.type).addClass("ktb-var-accent"),
                                            clearTimeout(Messages.title_timeouts.type),
                                            (Messages.title_timeouts.type = setTimeout(function () {
                                                $(".messages_title_" + t.type).removeClass("ktb-var-accent");
                                            }, 250))))
                                        : (e += t.text))
                                : (e += "<div class='output_msg'>" + t.text + "</div>"));
                    var n = $("#main_text_output_msg_wrapper .output_msg:visible").get(-l);
                    n && $(n).prevAll().remove();
                }),
                (Output.buffer = []),
                $("#main_text_output_msg_wrapper").append(e),
                n ? (Scroller.refresh(s), Scroller.move_down(s)) : $(s).addClass("k-state-selected");
            var d = kendo.toString(new Date(), "yyyy-MM-dd");
            return (
                Logs.date != d && (Logs.send(!0), (Logs.date = d)),
                    (Logs.buffer += e),
                    clearTimeout(Logs.buffer_timeout),
                    (Logs.buffer_timeout = setTimeout(function () {
                        Logs.send();
                    }, 1e3)),
                    !0
            );
        },
    };
(Messages = {
    element: null,
    options: {
        messages_types: [
            { Text: "Walka postaci", Id: "combat_avatar", Wizard: !1 },
            { Text: "Walka druĹźyny", Id: "combat_team", Wizard: !1 },
            { Text: "Walka innych", Id: "combat_others", Wizard: !1 },
            { Text: "Emocje", Id: "emotes", Wizard: !1 },
            { Text: "Komunikacja", Id: "comm", Wizard: !1 },
            { Text: "Komendy", Id: "command", Wizard: !1 },
            { Text: "Snoop", Id: "snoop", Wizard: !0 },
            { Text: "Wizline", Id: "wizline", Wizard: !0 },
        ],
    },
    title_timeouts: {},
    clear: function () {
        var e = Messages.element,
            a = Output.element;
        $("html").removeClass(function (e, a) {
            return (a.match(/(^|\s)messages_type_\S+/g) || []).join(" ");
        }),
            $("#messages_output_msg_wrapper").html(""),
            Scroller.refresh(e),
            Scroller.move_down(e),
            Scroller.refresh(a),
            Scroller.move_down(a);
    },
    refresh: function () {
        var e = Messages.element,
            a = Output.element;
        if ($("#messages_dialog").parent().is(":visible")) {
            $("html").removeClass(function (e, a) {
                return (a.match(/(^|\s)messages_type_\S+/g) || []).join(" ");
            }),
                $("#messages_output_msg_wrapper").html("");
            var t = $("#multiselect_messages_types").data("kendoMultiSelect").dataItems(),
                o = parseInt(Conf.data.output_limit || 50),
                n = [],
                i = [];
            $.each(t, function (e, a) {
                var t = a.Text,
                    o = a.Id;
                n.push('<span class="messages_title_' + o + '">' + t + "</span>"), i.push(".output_msg_" + o), $("html").addClass("messages_type_" + o);
            }),
                n.length
                    ? ($("#main_text_output_msg_wrapper").children(i.join(", ")).slice(-o).clone().appendTo("#messages_output_msg_wrapper"), $("#messages_dialog").data("kendoWindow").title(n.join(", ")))
                    : $("#messages_dialog").data("kendoWindow").title("Okno pomocnicze"),
                Scroller.refresh(e),
                Scroller.move_down(e),
                Scroller.refresh(a),
                Scroller.move_down(a);
        }
    },
}),
    (Scroller = {
        refresh: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            a && a.contentResized();
        },
        get_top: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            return a ? a.scrollTop : e.scrollTop;
        },
        get_height: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            return a ? a.scrollHeight() : e.scrollHeight;
        },
        get_left: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            return a ? a.scrollLeft : e.scrollLeft;
        },
        get_width: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            return a ? a.scrollWidth() : e.scrollWidth;
        },
        set_position: function (e, a, t) {
            t = t || Output.element;
            var o = $(t).data("kendoMobileScroller");
            o
                ? o.scrollTo(-1 * Math.max(0, Math.min(e, o.scrollWidth() - t.offsetWidth)), -1 * Math.max(0, Math.min(a, o.scrollHeight() - t.offsetHeight)))
                : ((t.scrollLeft = Math.min(e, t.scrollWidth - t.offsetWidth)), (t.scrollTop = Math.min(a, t.scrollHeight - t.offsetHeight)));
        },
        center_position: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            a
                ? a.scrollTo((-1 * Math.max(0, a.scrollWidth() - e.offsetWidth)) / 2, (-1 * Math.max(0, a.scrollHeight() - e.offsetHeight)) / 2)
                : ((e.scrollLeft = (e.scrollWidth - e.offsetWidth) / 2), (e.scrollTop = (e.scrollHeight - e.offsetHeight) / 2));
        },
        check_down: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            return a ? a.scrollTop >= a.scrollHeight() - e.offsetHeight : e.scrollTop >= e.scrollHeight - e.offsetHeight;
        },
        check_up: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            return a ? a.scrollTop <= 0 : e.scrollTop <= 0;
        },
        move_down: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            a ? a.scrollTo(0, Math.min(0, e.offsetHeight - a.scrollHeight())) : (e.scrollTop = e.scrollHeight);
        },
        move_up: function (e) {
            e = e || Output.element;
            var a = $(e).data("kendoMobileScroller");
            a ? a.scrollTo(0, 0) : (e.scrollTop = 0);
        },
    });
var Text = {
        capitalize: function (e) {
            return e.charAt(0).toUpperCase() + e.slice(1).toLowerCase();
        },
        lowercase: function (e) {
            return e.toLowerCase();
        },
        uppercase: function (e) {
            return e.toUpperCase();
        },
        encode_html: function (e) {
            return kendo.htmlEncode(e);
        },
        escape_diacritics: function (e) {
            return e
                .replace(/Ä/g, "a")
                .replace(/Ä/g, "A")
                .replace(/Ä/g, "c")
                .replace(/Ä/g, "C")
                .replace(/Ä/g, "e")
                .replace(/Ä/g, "E")
                .replace(/Ĺ/g, "l")
                .replace(/Ĺ/g, "L")
                .replace(/Ĺ/g, "n")
                .replace(/Ĺ/g, "N")
                .replace(/Ăł/g, "o")
                .replace(/Ă/g, "O")
                .replace(/Ĺ/g, "s")
                .replace(/Ĺ/g, "S")
                .replace(/Ĺź/g, "z")
                .replace(/Ĺť/g, "Z")
                .replace(/Ĺş/g, "z")
                .replace(/Ĺš/g, "Z");
        },
        replace_object_nums: function (e) {
            for (var a, t = new RegExp("ob_\\d+"), o = 0; (a = t.exec(e.substring(o))); ) {
                var n = Game.data.objects.descs[parseInt(a[0].substring(3))];
                n ? ((n = Text.encode_html("<" + n + ">")), (e = e.substring(0, o + a.index) + n + e.substring(o + a.index + a[0].length)), (o += a.index + n.length)) : (o += a.index + a[0].length);
            }
            return e;
        },
        get_width: function (e, a) {
            var t = a || "13px monospace",
                o = Text.get_width.measure_elem;
            return (
                o ? $(o).text(e).css("font", a) : ((o = Text.get_width.measure_elem = document.createElement("span")), $(o).text(e).css({ font: t, float: "left", "white-space": "nowrap", visibility: "hidden" }).appendTo($("body"))),
                    o.getBoundingClientRect().width
            );
        },
        get_height: function (e, a) {
            var t = a || "13px monospace",
                o = Text.get_width.measure_elem;
            return (
                o ? $(o).text(e).css("font", a) : ((o = Text.get_width.measure_elem = document.createElement("span")), $(o).text(e).css({ font: t, float: "left", "white-space": "nowrap", visibility: "hidden" }).appendTo($("body"))),
                    o.getBoundingClientRect().height
            );
        },
        style_system: function (e) {
            return '<div class="style_system">' + e + "</div>";
        },
        style_command: function (e) {
            return '<div class="style_command">&rarr; ' + Text.replace_object_nums(e) + "</div>";
        },
        style_blocked_command: function (e) {
            return '<div class="style_blocked_command">&empty; ' + Text.replace_object_nums(e) + "</div>";
        },
        style_multi_command: function (e) {
            return Text.replace_object_nums(e).replace(new RegExp("\\n", "g"), '<span class="style_multi_command">' + String.fromCharCode(8629) + "</span>");
        },
        compress: function (e) {
            var a = new Uint16Array(
                    pako.deflate(
                        new Uint8Array(
                            e.split("").map(function (e) {
                                return e.charCodeAt(0);
                            })
                        )
                    )
                ),
                t = a.length;
            e = "";
            for (var o = 0; o < t; o++) e += String.fromCharCode(a[o]);
            return btoa(e);
        },
        uncompress: function (e) {
            var a = new Uint16Array(
                    pako.inflate(
                        atob(e)
                            .split("")
                            .map(function (e) {
                                return e.charCodeAt(0);
                            })
                    )
                ),
                t = a.length;
            e = "";
            for (var o = 0; o < t; o++) e += String.fromCharCode(a[o]);
            return e;
        },
        filter_alphanumeric: function (e) {
            var a = e.length;
            for (e = Text.escape_diacritics(e); a--; ) (e.charCodeAt(a) < 32 || e.charCodeAt(a) > 126) && (e = e.slice(0, a) + e.slice(a + 1));
            return e;
        },
        filter_multi_alphanumeric: function (e) {
            var a = e.length;
            for (e = Text.escape_diacritics(e); a--; ) 10 != e.charCodeAt(a) && (e.charCodeAt(a) < 32 || e.charCodeAt(a) > 126) && (e = e.slice(0, a) + e.slice(a + 1));
            return e;
        },
        filter_numeric: function (e) {
            for (var a = e.length; a--; ) (e.charCodeAt(a) < 48 || e.charCodeAt(a) > 57) && (e = e.slice(0, a) + e.slice(a + 1));
            return e;
        },
        filter_alphabetic: function (e) {
            var a = e.length;
            for (e = Text.escape_diacritics(e); a--; ) (e.charCodeAt(a) < 65 || e.charCodeAt(a) > 122 || (e.charCodeAt(a) > 90 && e.charCodeAt(a) < 97)) && (e = e.slice(0, a) + e.slice(a + 1));
            return e;
        },
        encode_filename: function (e) {
            return encodeURIComponent(btoa(encodeURIComponent(e)));
        },
        decode_filename: function (e) {
            return decodeURIComponent(atob(decodeURIComponent(e)));
        },
        encode_UTF16: function (e) {
            try {
                return decodeURIComponent(
                    (function (e) {
                        return e.replace(/[\x00-),:-?[-^`{-\xFF]/g, function (e) {
                            return "%" + ((e = e.charCodeAt()) < 16 ? "0" : "") + e.toString(16).toUpperCase();
                        });
                    })(e)
                );
            } catch (a) {
                return e;
            }
        },
        decode_UTF16: function (e) {
            try {
                return (function (e) {
                    return e.replace(/%([0-9A-F]{2})/gi, function (e, a) {
                        return String.fromCharCode(parseInt(a, 16));
                    });
                })(encodeURIComponent(e));
            } catch (a) {
                return e;
            }
        },
        get_date: function (e) {
            var a = $.map(e.split(/[^0-9]/), function (e) {
                return parseInt(e, 10);
            });
            return new Date(a[0], a[1] - 1 || 0, a[2] || 1, a[3] || 0, a[4] || 0, a[5] || 0, a[6] || 0);
        },
        parse_patterns: function (e) {
            for (
                var a,
                    t = Conf.defaults.color_codes.xterm,
                    o = $.isPlainObject(Conf.data.color_codes) && Array.isArray(Conf.data.color_codes.ansi.dark) ? Conf.data.color_codes.ansi.dark : Conf.defaults.color_codes.ansi.dark,
                    n = $.isPlainObject(Conf.data.color_codes) && Array.isArray(Conf.data.color_codes.ansi.bright) ? Conf.data.color_codes.ansi.bright : Conf.defaults.color_codes.ansi.bright,
                    i = [],
                    s = [],
                    r = [],
                    l = [],
                    d = [],
                    c = new RegExp("\\033\\133[0-9]+(?:;[0-9]+)*\\155", "g"),
                    p = 0,
                    _ = e;
                (match = c.exec(e));

            ) {
                var u = e.substring(match.index + 2, match.index + match[0].length - 1),
                    m = l.length;
                "0" == u || "39;22" == u
                    ? r.length > m && (r[m] <= match.index - 1 + p ? (l[m] = match.index - 1 + p) : (i.splice(m, 1), r.splice(m, 1)))
                    : "22;38;5;" == u.substring(0, 8)
                        ? (r.length > m && (r[m] <= match.index - 1 + p ? (l[m] = match.index - 1 + p) : (i.splice(m, 1), r.splice(m, 1))), (i[(y = i.length)] = t[parseInt(u.substring(8)) - 1]), (r[y] = match.index + p))
                        : "22;" == u.substring(0, 3)
                            ? (r.length > m && (r[m] <= match.index - 1 + p ? (l[m] = match.index - 1 + p) : (i.splice(m, 1), r.splice(m, 1))), (i[(y = i.length)] = o[parseInt(u.substring(3)) - 30]), (r[y] = match.index + p))
                            : ";1" == u.substring(u.length - 2) &&
                            (r.length > m && (r[m] <= match.index - 1 + p ? (l[m] = match.index - 1 + p) : (i.splice(m, 1), r.splice(m, 1))), (i[(y = i.length)] = n[parseInt(u.substring(0, u.length - 2)) - 30]), (r[y] = match.index + p)),
                    (_ = _.substring(0, match.index + p) + _.substring(match.index + p + match[0].length)),
                    (p -= match[0].length);
            }
            for (r.length > l.length && (l[l.length] = _.length), e = _, a = Array.isArray(Conf.data.patterns) ? Conf.data.patterns.length : 0; a--; ) {
                var f,
                    h = Conf.data.patterns[a],
                    g = [],
                    k = [],
                    w = [];
                if ($.isPlainObject(h)) {
                    for (c = new RegExp(h.Regexp, "m"), f = 0; (match = c.exec(e.substring(f))) && match[0].length && (void 0 !== h.Sound && -1 == s.indexOf(h.Sound) && s.push(h.Sound), void 0 !== h.Color || void 0 !== h.Replacement); ) {
                        var v = g.length;
                        (g[v] = h.Color),
                            (k[v] = f + match.index),
                            (w[v] = f + match.index + Math.max(0, match[0].length - 1)),
                            $("html").hasClass("text_replacements") && "string" == typeof h.Replacement
                                ? ((_ = h.Replacement.length ? Text.encode_html(Input.check_variables(h.Replacement, match)) : ""), (e = e.substring(0, k[v]) + _ + e.substring(w[v] + 1)), (p = _.length - match[0].length))
                                : (p = 0);
                        for (var b = i.length; b--; )
                            if (r[b] >= k[v] && l[b] <= w[v]) i.splice(b, 1), r.splice(b, 1), l.splice(b, 1);
                            else if (i[b] === g[v])
                                r[b] < k[v] && l[b] > w[v]
                                    ? ((k[v] = r[b]), (w[v] = l[b]), i.splice(b, 1), r.splice(b, 1), l.splice(b, 1))
                                    : r[b] < k[v] && l[b] <= w[v] && l[b] >= k[v] - 1
                                        ? ((k[v] = r[b]), i.splice(b, 1), r.splice(b, 1), l.splice(b, 1))
                                        : r[b] >= k[v] && r[b] <= w[v] + 1 && l[b] > w[v]
                                            ? ((w[v] = l[b]), i.splice(b, 1), r.splice(b, 1), l.splice(b, 1))
                                            : r[b] == w[v] + 1
                                                ? ((k[v] = r[b]), (w[v] = l[b]), i.splice(b, 1), r.splice(b, 1), l.splice(b, 1))
                                                : (r[b] >= k[v] && (r[b] += p), l[b] >= w[v] && (l[b] += p));
                            else if (r[b] < k[v] && l[b] > w[v]) {
                                var y = i.length;
                                (i[y] = i[b]), (r[y] = w[v] + 1 + p), (l[y] = l[b] + p), (l[b] = k[v] - 1);
                            } else
                                r[b] < k[v] && l[b] <= w[v] && l[b] >= k[v]
                                    ? (l[b] = k[v] - 1)
                                    : r[b] >= k[v] && r[b] <= w[v] && l[b] > w[v]
                                        ? ((r[b] = w[v] + 1 + p), (l[b] += p))
                                        : (r[b] >= k[v] && (r[b] += p), l[b] >= w[v] && (l[b] += p));
                        (f += match.index + match[0].length + p), (w[v] += p);
                    }
                    (i = i.concat(g)), (r = r.concat(k)), (l = l.concat(w));
                }
            }
            for (b = l.length, a = 0; a < b; ++a) d[a] = a;
            for (
                d.sort(function (e, a) {
                    return l[e] - l[a];
                });
                b--;

            ) {
                var C,
                    x = r[(f = d[b])];
                m = l[f];
                (C = e.substring(x, m + 1)) &&
                (e = $("html").hasClass("colors") && "string" == typeof i[f] ? e.substring(0, x) + '<span style="color:' + i[f] + '">' + C + "</span>" + e.substring(m + 1) : e.substring(0, x) + C + e.substring(m + 1));
            }
            return (
                $("html").hasClass("sounds") &&
                s.length &&
                $.each(Conf.options.sounds, function (e, a) {
                    if (s.indexOf(a.Id) > -1)
                        try {
                            a.Sound.pause(), (a.Sound.currentTime = 0), a.Sound.play();
                        } catch (e) {}
                }),
                    e
            );
        },
    },
    Gmcp = {
        send: function (e, a) {
            var t = String.fromCharCode(255),
                o = String.fromCharCode(250),
                n = String.fromCharCode(240),
                i = String.fromCharCode(201);
            return (
                !("" == e || void 0 === e || e.length > 32 || !1 === Client.options.gmcp) &&
                (Client.options.debug && (console.log("out"), console.log(e), console.log(a)), "" == a || void 0 === a ? Client.send(t + o + i + e + t + n) : !(a.length > 45e3) && Client.send(t + o + i + e + " " + a + t + n))
            );
        },
        parse_option: function (e) {
            return 3 == e.length ? Gmcp.parse_option_negotiation(e) : Gmcp.parse_option_subnegotiation(e), "";
        },
        parse_option_negotiation: function (e) {
            var a = String.fromCharCode(255),
                t = String.fromCharCode(251),
                o = String.fromCharCode(252),
                n = String.fromCharCode(253),
                i = String.fromCharCode(254),
                s = String.fromCharCode(1),
                r = String.fromCharCode(201),
                l = String.fromCharCode(86);
            switch (e[1]) {
                case t:
                    switch (e[2]) {
                        case s:
                            1 == Client.options.echo && (Client.send(a + n + e[2]), (Client.options.echo = !1));
                            break;
                        case r:
                            0 == Client.options.gmcp && (Client.send(a + n + e[2]), (Client.options.gmcp = !0));
                            break;
                        case l:
                            0 == Client.options.opt_mccp && (Client.send(a + n + e[2]), (Client.options.opt_mccp = !0));
                            break;
                        default:
                            Client.send(a + i + e[2]);
                    }
                    break;
                case o:
                    switch (e[2]) {
                        case s:
                            0 == Client.options.echo && (Client.send(a + i + e[2]), (Client.options.echo = !0));
                            break;
                        case r:
                            1 == Client.options.gmcp && (Client.send(a + i + e[2]), (Client.options.gmcp = !1));
                            break;
                        case l:
                            1 == Client.options.mccp && (Client.send(a + i + e[2]), (Client.options.mccp = !1));
                    }
                    break;
                case n:
                    switch (e[2]) {
                        case s:
                            1 == Client.options.echo && (Client.send(a + t + e[2]), (Client.options.echo = !1));
                            break;
                        case r:
                            0 == Client.options.gmcp && (Client.send(a + t + e[2]), (Client.options.gmcp = !0));
                            break;
                        case l:
                            0 == Client.options.mccp && (Client.send(a + t + e[2]), (Client.options.mccp = !0));
                            break;
                        default:
                            Client.send(a + o + e[2]);
                    }
                    break;
                case i:
                    switch (e[2]) {
                        case s:
                            0 == Client.options.echo && (Client.send(a + o + e[2]), (Client.options.echo = !0));
                            break;
                        case r:
                            1 == Client.options.gmcp && (Client.send(a + o + e[2]), (Client.options.gmcp = !1));
                            break;
                        case l:
                            1 == Client.options.mccp && (Client.send(a + o + e[2]), (Client.options.mccp = !1));
                    }
            }
        },
        parse_option_subnegotiation: function (match) {
            if ((match = match.substring(2, match.length - 2)) == String.fromCharCode(86)) Client.options.mccp = !0;
            else if (match.substring(0, 1) == String.fromCharCode(201)) {
                var data = match.substring(1),
                    gmcp_json = {},
                    index;
                if (!data.length) return;
                var tmp = data.indexOf(" ");
                (index = data.substring(0, tmp).toLowerCase()), (data = data.substring(tmp + 1)), "gmcp_msgs" == index && (data = data.replace(//g, "\\u001B"));
                try {
                    gmcp_json = jQuery.parseJSON(data);
                } catch (e) {
                    return void ("client.conf.get" == index && ($("#notification_game").data("kendoNotification").error("BĹÄd przy odczycie konfiguracji klienta."), (Conf.data = Conf.check({}, !0)), Conf.refresh()));
                }
                Client.options.debug && (console.log("in"), console.log(index), console.log(gmcp_json));
                for (var level = index.split("."); level.length < 3; ) level.push("");
                switch (level[0]) {
                    case "client":
                        switch (level[1]) {
                            case "conf":
                                switch (level[2]) {
                                    case "get":
                                        if ($("html").hasClass("game"))
                                            if (gmcp_json.filename)
                                                if ("success" == gmcp_json.status && gmcp_json.data && void 0 !== gmcp_json.md5 && gmcp_json.md5 == md5(gmcp_json.data)) {
                                                    gmcp_json.compressed ? (gmcp_json.data = Text.uncompress(gmcp_json.data)) : (gmcp_json.data = LZString.decompressFromBase64(gmcp_json.data));
                                                    try {
                                                        gmcp_json.data = jQuery.parseJSON(gmcp_json.data);
                                                    } catch (e) {
                                                        return void $("#notification_game")
                                                            .data("kendoNotification")
                                                            .error("BĹÄd przy wczytywaniu zapisu konfiguracji o nazwie '" + Text.decode_filename(gmcp_json.filename) + "'. SprĂłbuj ponownie.");
                                                    }
                                                    gmcp_json.data = Conf.check(gmcp_json.data, !0);
                                                    var tmp_data = {};
                                                    (tmp_data.data = Text.compress(JSON.stringify(Conf.encode(gmcp_json.data)))),
                                                        (tmp_data.md5 = md5(tmp_data.data)),
                                                        (tmp_data.compressed = !0),
                                                        !0 !== Gmcp.send("client.conf.set", JSON.stringify(tmp_data))
                                                            ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                                            : ((Conf.data = gmcp_json.data), Conf.refresh());
                                                } else
                                                    $("#notification_game")
                                                        .data("kendoNotification")
                                                        .error("BĹÄd przy wczytywaniu zapisu konfiguracji o nazwie '" + Text.decode_filename(gmcp_json.filename) + "'. SprĂłbuj ponownie.");
                                            else if ("success" == gmcp_json.status && gmcp_json.data)
                                                if (void 0 !== gmcp_json.md5) {
                                                    if (gmcp_json.md5 == md5(gmcp_json.data)) {
                                                        gmcp_json.compressed ? (gmcp_json.data = Text.uncompress(gmcp_json.data)) : (gmcp_json.data = LZString.decompressFromBase64(gmcp_json.data));
                                                        try {
                                                            gmcp_json.data = jQuery.parseJSON(gmcp_json.data);
                                                        } catch (e) {
                                                            return void $("#notification_game").data("kendoNotification").error("BĹÄd przy wczytywaniu konfiguracji. SprĂłbuj ponownie.");
                                                        }
                                                        (Conf.data = Conf.check(gmcp_json.data, !0)), Conf.refresh();
                                                    }
                                                } else (Conf.data = Conf.check(gmcp_json.data, !0)), Conf.refresh();
                                            else $("#notification_game").data("kendoNotification").error("BĹÄd przy wczytywaniu konfiguracji. SprĂłbuj ponownie.");
                                        break;
                                    case "set":
                                        if ($("html").hasClass("game"))
                                            if ("success" == gmcp_json.status)
                                                if (gmcp_json.filename)
                                                    $("#notification_game")
                                                        .data("kendoNotification")
                                                        .success("Konfiguracja zostaĹa zapisana pod nazwÄ '" + Text.decode_filename(gmcp_json.filename) + "'."),
                                                        Gmcp.send("client.conf.list");
                                                else
                                                    switch (gmcp_json.type) {
                                                        case "conf":
                                                            $("#notification_game").data("kendoNotification").success("Ustawienia klienta zostaĹy zapisane.");
                                                            break;
                                                        case "aliases":
                                                            $("#notification_game").data("kendoNotification").success("Konfiguracja aliasĂłw zostaĹa zapisana.");
                                                            break;
                                                        case "macros":
                                                            $("#notification_game").data("kendoNotification").success("Konfiguracja makr zostaĹa zapisana.");
                                                            break;
                                                        case "buttons":
                                                            $("#notification_game").data("kendoNotification").success("Konfiguracja przyciskĂłw zostaĹa zapisana.");
                                                            break;
                                                        case "actions":
                                                            $("#notification_game").data("kendoNotification").success("Konfiguracja akcji zostaĹa zapisana.");
                                                            break;
                                                        case "patterns":
                                                            $("#notification_game").data("kendoNotification").success("Konfiguracja zasad przeksztaĹcania teksu zostaĹa zapisana.");
                                                            break;
                                                        default:
                                                            $("#notification_game").data("kendoNotification").success("Konfiguracja zostaĹa zapisana.");
                                                    }
                                            else
                                                gmcp_json.filename
                                                    ? $("#notification_game")
                                                        .data("kendoNotification")
                                                        .success("BĹÄd w zapisie konfiguracji pod nazwÄ '" + Text.decode_filename(gmcp_json.filename) + "'. SprĂłbuj ponownie.")
                                                    : $("#notification_game").data("kendoNotification").error("BĹÄd w zapisie konfiguracji. SprĂłbuj ponownie.");
                                        break;
                                    case "remove":
                                        $("html").hasClass("game") &&
                                        ("success" == gmcp_json.status
                                            ? (gmcp_json.filename &&
                                            $("#notification_game")
                                                .data("kendoNotification")
                                                .success("Zapis konfiguracji o nazwie '" + Text.decode_filename(gmcp_json.filename) + "' zostaĹ usuniÄty."),
                                                Gmcp.send("client.conf.list"))
                                            : gmcp_json.filename &&
                                            $("#notification_game")
                                                .data("kendoNotification")
                                                .error("BĹÄd przy usuwaniu zapisu konfiguracji o nazwie '" + Text.decode_filename(gmcp_json.filename) + "'. SprĂłbuj ponownie."));
                                        break;
                                    case "list":
                                        if ($("html").hasClass("game") && "success" == gmcp_json.status && Array.isArray(gmcp_json.files)) {
                                            var dataSource = new kendo.data.DataSource({ data: gmcp_json.files, sort: [{ field: "time", dir: "desc" }] });
                                            $("#listview_import_conf").data("kendoListView").setDataSource(dataSource);
                                        }
                                }
                                break;
                            case "server":
                                $("html").hasClass("login") && "fail" == gmcp_json.status && ($(".login_window").hide(), $("#connect_window").show(), $(".connect_window_body").hide(), $("#shutdown_body").show());
                                break;
                            case "connect":
                                if ($("html").hasClass("login")) {
                                    Gmcp.send("core.options.add", '["base64_gmcp_msgs"]'),
                                        Client.send(String.fromCharCode(255) + String.fromCharCode(253) + String.fromCharCode(86)),
                                        $(".login_window").hide(),
                                        $(".connect_window_body").hide(),
                                        $("#login_body").show(),
                                        "source=generator-imion" == Client.params
                                            ? ($("#create_account_window").show(), $("html").hasClass("touch") || $("#input_create_account").focus())
                                            : ($("#connect_window").show(),
                                                $("html").hasClass("mobile-small") || "" == Client.params ? $("html").hasClass("touch") || $("#input_connect_login").focus() : $("#intro_dialog").data("kendoWindow").center().open());
                                    var client_data = {};
                                    if (Client.options.debug) client_data.params = "source=debug";
                                    else if ("" != Client.params) client_data.params = Client.params;
                                    else {
                                        var session_params;
                                        $("html").hasClass("storage") && (session_params = Storage.read("params")) ? (client_data.params = session_params + "(return)") : (client_data.params = "source=www");
                                    }
                                    Gmcp.send("client.source", JSON.stringify(client_data)), $("html").hasClass("storage") && Client.params && Storage.send("params", Client.params);
                                }
                                break;
                            case "logout":
                                Client.disconnect(!0);
                                break;
                            case "debug":
                                if (gmcp_json.code) {
                                    var result;
                                    try {
                                        result = eval(gmcp_json.code);
                                    } catch (e) {
                                        result = e.message;
                                    }
                                    var debug_data = {};
                                    (debug_data.code = gmcp_json.code), (debug_data.result = result), Gmcp.send("client.debug", JSON.stringify(debug_data));
                                }
                        }
                        break;
                    case "account":
                        switch (level[1]) {
                            case "create":
                                $("html").hasClass("login") &&
                                ("fail" == gmcp_json.status
                                    ? (gmcp_json.msg && $("#create_account_window .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg)), $("#input_create_account").focus())
                                    : "success" == gmcp_json.status &&
                                    ($("html").addClass("account").removeClass("game").removeClass("login"),
                                        $(".login_window .k-textbox").val(""),
                                        $("#notification_login").data("kendoNotification").hide(),
                                        $("#notification_game").data("kendoNotification").hide(),
                                        $(".account_window").hide(),
                                        $("#create_char_window").show(),
                                        Gmcp.send("account.info"),
                                        Gmcp.send("account.options"),
                                        $("#notification_account")
                                            .data("kendoNotification")
                                            .info(
                                                "Za chwilÄ" + (gmcp_json.email ? " na adres " + gmcp_json.email : "") + ' otrzymasz email z hasĹem do logowania.<div class="clear"></div>Jednak juĹź teraz moĹźesz stworzyÄ swojÄ postaÄ.'
                                            )));
                                break;
                            case "login":
                                $("html").hasClass("login") &&
                                ("fail" == gmcp_json.status
                                    ? (gmcp_json.msg && $("#connect_window .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg)),
                                        -1 != [2, 3, 4, 7, 12].indexOf(gmcp_json.code) ? $("#input_connect_login").focus() : 5 == gmcp_json.code && $("#input_connect_password").focus())
                                    : "success" == gmcp_json.status &&
                                    ($("html").addClass("account").removeClass("game").removeClass("login"),
                                        $(".login_window .k-textbox").val(""),
                                        $("#notification_login").data("kendoNotification").hide(),
                                        $("#notification_game").data("kendoNotification").hide(),
                                        $(".account_window").hide(),
                                        $("#account_menu_window").show(),
                                        Gmcp.send("account.info"),
                                        Gmcp.send("account.options")));
                                break;
                            case "info":
                                if ($("html").hasClass("account")) {
                                    if (((Account.data = gmcp_json), Account.data.blocked ? $(".show_block_account").hide() : $(".show_unblock_account").hide(), Account.data.chars.length)) {
                                        $(".show_chars").show(), $(".show_no_chars").hide();
                                        var listview = $("#listview_chars_list").data("kendoListView"),
                                            dataSource = new kendo.data.DataSource({ data: jQuery.extend(!0, [], Account.data.chars) });
                                        listview.setDataSource(dataSource), listview.select(listview.element.children().first());
                                    } else $(".show_chars").hide(), $(".show_no_chars").show();
                                    var details_text = "";
                                    Account.data.email && (details_text += '<h5 class="uppercase">Adres email</h5><h4>' + Account.data.email + "</h4>"),
                                    Account.data.creation_time && (details_text += '<h5 class="uppercase">Data zaĹoĹźenia</h5><h4>' + kendo.toString(new Date(1e3 * Account.data.creation_time), "g") + "</h4>"),
                                    Account.data.login_time &&
                                    ((details_text += '<h5 class="uppercase">Ostatnie logowanie</h5><h4>' + kendo.toString(new Date(1e3 * Account.data.login_time), "g")),
                                    Account.data.login_from && (details_text += "<br>z " + Account.data.login_from),
                                        (details_text += "</h4>")),
                                        $("#acount_menu_details_text").html(details_text);
                                }
                                break;
                            case "check_name":
                                $("html").hasClass("account") && "fail" == gmcp_json.status && gmcp_json.msg && $("#notification_name").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg));
                                break;
                            case "change":
                                switch (level[2]) {
                                    case "email":
                                        $("html").hasClass("account") &&
                                        ("fail" == gmcp_json.status
                                            ? gmcp_json.msg && $("#acount_menu_change_email .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg))
                                            : "success" == gmcp_json.status &&
                                            (Gmcp.send("account.info"),
                                                $(".account_window .k-textbox:visible").val(""),
                                                $("#acount_menu_change_email .notification")
                                                    .data("kendoNotification")
                                                    .success("Adres email zostaĹ zmieniony na " + gmcp_json.new_email + ".", "success")));
                                        break;
                                    case "password":
                                        $("html").hasClass("account") &&
                                        ("fail" == gmcp_json.status
                                            ? gmcp_json.msg && $("#acount_menu_change_password .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg))
                                            : "success" == gmcp_json.status &&
                                            ($(".account_window .k-textbox:visible").val(""), $("#acount_menu_change_password .notification").data("kendoNotification").success("HasĹo zostaĹo zmienione.", "success")));
                                }
                                break;
                            case "block":
                                $("html").hasClass("account") &&
                                ("fail" == gmcp_json.status
                                    ? gmcp_json.msg && $("#acount_menu_block_account .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg))
                                    : "success" == gmcp_json.status &&
                                    ((Account.data.blocked = !0),
                                        $(".show_block_account").hide("slow"),
                                        $(".show_unblock_account").show("slow"),
                                        $("#datetime_picker_block_account").val(""),
                                        $("#input_block_account_password").val(""),
                                        $("#acount_menu_block_account .notification").data("kendoNotification").success("Konto zostaĹo zablokowane.", "success")));
                                break;
                            case "unblock":
                                $("html").hasClass("account") &&
                                ("fail" == gmcp_json.status
                                    ? gmcp_json.msg && $("#acount_menu_block_account .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg))
                                    : "success" == gmcp_json.status &&
                                    ((Account.data.blocked = !1),
                                        $(".show_unblock_account").hide("slow"),
                                        $(".show_block_account").show("slow"),
                                        $("#acount_menu_block_account .notification").data("kendoNotification").success("Konto zostaĹo odblokowane.", "success")));
                                break;
                            case "options":
                                if ($("html").hasClass("account")) {
                                    Account.options = gmcp_json;
                                    var dataSource = new kendo.data.DataSource({ data: jQuery.extend(!0, [], Account.options.races) });
                                    $("#dropdown_set_race").data("kendoDropDownList").setDataSource(dataSource),
                                        (dataSource = new kendo.data.DataSource({ data: jQuery.extend(!0, [], Account.options.genders) })),
                                        $("#dropdown_set_gender").data("kendoDropDownList").setDataSource(dataSource),
                                        (dataSource = new kendo.data.DataSource({ data: jQuery.extend(!0, [], Account.options.startlocs) })),
                                        $("#dropdown_set_startloc").data("kendoDropDownList").setDataSource(dataSource),
                                        Account.set_adjectives_datasources(!0);
                                }
                        }
                        break;
                    case "char":
                        switch (level[1]) {
                            case "info":
                                if ($("html").hasClass("game")) {
                                    Game.data.char = gmcp_json;
                                    var dataSource = jQuery.extend(!0, [], Messages.options.messages_types);
                                    !0 !== gmcp_json.wizard
                                        ? (dataSource = dataSource.filter(function (e, a, t) {
                                            return !0 !== e.Wizard;
                                        }))
                                        : ($("html").addClass("wizard"), $("#bottommenu").data("kendoToolBar").resize()),
                                        (dataSource = new kendo.data.DataSource({ data: dataSource })),
                                        $("#multiselect_messages_types").data("kendoMultiSelect").setDataSource(dataSource),
                                    Game.data.char.new_player && $("#topmenu").data("kendoToolBar").show("#topmenu_tutorial_overflow");
                                }
                                break;
                            case "state":
                                $("html").hasClass("game") &&
                                (gmcp_json.hp >= 0 &&
                                $("#health_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * (gmcp_json.hp + 1)) / 7)),
                                gmcp_json.mana >= 0 &&
                                $("#mana_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * (gmcp_json.mana + 1)) / 9)),
                                gmcp_json.fatigue >= 0 &&
                                $("#fatigue_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * gmcp_json.fatigue) / 9)),
                                gmcp_json.improve >= 0 &&
                                $("#exp_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * gmcp_json.improve) / 15)),
                                gmcp_json.form >= 0 &&
                                $("#form_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * gmcp_json.form) / 3)),
                                gmcp_json.intox >= 0 &&
                                $("#intox_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * gmcp_json.intox) / 10)),
                                gmcp_json.headache >= 0 &&
                                $("#headache_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * gmcp_json.headache) / 6)),
                                gmcp_json.stuffed >= 0 &&
                                $("#stuffed_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * (3 - gmcp_json.stuffed)) / 3)),
                                gmcp_json.soaked >= 0 &&
                                $("#soaked_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * (3 - gmcp_json.soaked)) / 3)),
                                gmcp_json.encumbrance >= 0 &&
                                $("#encumbrance_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * gmcp_json.encumbrance) / 6)),
                                gmcp_json.panic >= 0 &&
                                $("#panic_bar")
                                    .data("kendoProgressBar")
                                    .value(Math.floor((100 * gmcp_json.panic) / 5)));
                                break;
                            case "login":
                                ($("html").hasClass("login") || $("html").hasClass("account")) &&
                                ("fail" == gmcp_json.status
                                    ? (gmcp_json.msg &&
                                    ($("html").hasClass("login")
                                        ? $("#connect_window .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg))
                                        : $("#acount_menu_chars .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg))),
                                        -1 != [2, 3, 4, 7, 12].indexOf(gmcp_json.code) ? $("#input_connect_login").focus() : 5 == gmcp_json.code && $("#input_connect_password").focus())
                                    : "success" == gmcp_json.status &&
                                    ($("html").addClass("game").removeClass("account").removeClass("login"),
                                        $(".account_window .k-textbox, .login_window .k-textbox").val(""),
                                        $("#notification_login").data("kendoNotification").hide(),
                                        $("#notification_account").data("kendoNotification").hide(),
                                    $("#game .loading_img").length ||
                                    ($("#game").append('<img class="loading_img" src="images/loading.gif" />'),
                                        setTimeout(function () {
                                            $("#game .loading_img").show();
                                        }, 250)),
                                        Client.resize(),
                                    $("html").hasClass("touch") || $(Input.element).focus(),
                                        Gmcp.send("client.conf.get"),
                                        Gmcp.send("client.conf.list"),
                                        Storage.clear("params")));
                                break;
                            case "create":
                                $("html").hasClass("account") &&
                                ("fail" == gmcp_json.status
                                    ? gmcp_json.msg && $("#notification_create_char").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg))
                                    : "success" == gmcp_json.status &&
                                    ($("html").addClass("game").removeClass("account").removeClass("login"),
                                        $(".account_window .k-textbox, .login_window .k-textbox").val(""),
                                        $("#notification_login").data("kendoNotification").hide(),
                                        $("#notification_account").data("kendoNotification").hide(),
                                    $("#game .loading_img").length ||
                                    ($("#game").append('<img class="loading_img" src="images/loading.gif" />'),
                                        setTimeout(function () {
                                            $("#game .loading_img").show();
                                        }, 250)),
                                        Client.resize(),
                                        Gmcp.send("client.conf.get"),
                                    Account.data.new_player &&
                                    ($("#topmenu").data("kendoToolBar").show("#topmenu_tutorial_overflow"),
                                        $("#tutorial_dialog").parent().is(":visible") ? $("#tutorial_dialog").data("kendoWindow").toFront() : $("#tutorial_dialog").data("kendoWindow").center().open()),
                                        Storage.clear("params")));
                                break;
                            case "block":
                                if ($("html").hasClass("account"))
                                    if ("fail" == gmcp_json.status) gmcp_json.msg && $("#acount_menu_chars .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg));
                                    else if ("success" == gmcp_json.status) {
                                        if (!gmcp_json.name) return;
                                        var listview = $("#listview_chars_list").data("kendoListView"),
                                            selected = listview.select().text();
                                        $.each(Account.data.chars, function (e, a) {
                                            if ($(a).attr("name") == gmcp_json.name) return $(a).attr("blocked", !0), !1;
                                        });
                                        var dataSource = new kendo.data.DataSource({ data: jQuery.extend(!0, [], Account.data.chars) });
                                        listview.setDataSource(dataSource),
                                            listview.refresh(),
                                        selected &&
                                        $.each(listview.element.children(), function (e, a) {
                                            if ($(a).text() == selected) return listview.select(a), !1;
                                        }),
                                            $("#acount_menu_chars .notification")
                                                .data("kendoNotification")
                                                .success("PostaÄ " + Text.capitalize(gmcp_json.name) + " zostaĹa zablokowana.", "success");
                                    }
                                break;
                            case "unblock":
                                if ($("html").hasClass("account"))
                                    if ("fail" == gmcp_json.status) gmcp_json.msg && $("#acount_menu_chars .notification").data("kendoNotification").error(Text.encode_UTF16(gmcp_json.msg));
                                    else if ("success" == gmcp_json.status) {
                                        if (!gmcp_json.name) return;
                                        var listview = $("#listview_chars_list").data("kendoListView"),
                                            selected = listview.select().text();
                                        $.each(Account.data.chars, function (e, a) {
                                            if ($(a).attr("name") == gmcp_json.name) return $(a).attr("blocked", !1), !1;
                                        });
                                        var dataSource = new kendo.data.DataSource({ data: jQuery.extend(!0, [], Account.data.chars) });
                                        listview.setDataSource(dataSource),
                                            listview.refresh(),
                                        selected &&
                                        $.each(listview.element.children(), function (e, a) {
                                            if ($(a).text() == selected) return listview.select(a), !1;
                                        }),
                                            $("#acount_menu_chars .notification")
                                                .data("kendoNotification")
                                                .success("PostaÄ " + Text.capitalize(gmcp_json.name) + " zostaĹa odblokowana.", "success");
                                    }
                        }
                        break;
                    case "room":
                        switch (level[1]) {
                            case "info":
                                if ($("html").hasClass("game")) {
                                    var exits = [];
                                    $("#directions_custom_buttons .directions").remove(),
                                        $(".directions").removeClass("k-state-selected"),
                                    gmcp_json.exits &&
                                    gmcp_json.exits.length &&
                                    ((exits = jQuery.extend(!0, [], gmcp_json.exits)),
                                        $(".directions").each(function () {
                                            var e = exits.indexOf($(this).attr("id"));
                                            -1 != e && ($(this).addClass("k-state-selected"), exits.splice(e, 1));
                                        })),
                                    exits.length &&
                                    (exits.sort(),
                                        $.each(exits, function (e, a) {
                                            $("<input></input>")
                                                .prop("type", "submit")
                                                .prop("value", a)
                                                .prop("title", "IdĹş na '" + a + "'")
                                                .appendTo($("#directions_custom_buttons"))
                                                .attr("id", a)
                                                .addClass("directions")
                                                .addClass("k-no-hover")
                                                .addClass("flex_shrink")
                                                .addClass("button")
                                                .addClass("k-state-selected")
                                                .kendoButton()
                                                .kendoTouch({
                                                    doubleTapTimeout: 0,
                                                    tap: function (e) {
                                                        e.event.preventDefault(), Input.send($(this.element).attr("id"));
                                                    },
                                                });
                                        })),
                                        gmcp_json.map ? Maps.set_position(gmcp_json.map) : Maps.unset_position(),
                                        Touch.resize(),
                                        Game.resize();
                                }
                        }
                        break;
                    case "gmcp_msgs":
                        if ($("html").hasClass("game") && gmcp_json.type && gmcp_json.text.length) {
                            var buffer_len = Output.buffer.length;
                            if (buffer_len && Output.buffer[buffer_len - 1].type == gmcp_json.type) Output.buffer[buffer_len - 1].text += atob(gmcp_json.text);
                            else {
                                var tmp_object = {};
                                (tmp_object.text = atob(gmcp_json.text)), (tmp_object.type = gmcp_json.type), Output.buffer.push(tmp_object);
                            }
                        }
                        break;
                    case "objects":
                        switch (level[1]) {
                            case "nums":
                                $("html").hasClass("game") &&
                                Array.isArray(gmcp_json) &&
                                ($.each(Object.keys(Game.data.objects.data), function (e, a) {
                                    -1 == gmcp_json.indexOf(parseInt(a)) && delete Game.data.objects.data[a];
                                }),
                                    (Game.data.objects.list = gmcp_json),
                                    clearTimeout(Game.panel_chars_timeout),
                                    (Game.panel_chars_timeout = setTimeout(function () {
                                        Game.refresh_panel_chars();
                                    }, 10)));
                                break;
                            case "data":
                                $("html").hasClass("game") &&
                                $.isPlainObject(gmcp_json) &&
                                ($.each(Object.keys(Game.data.objects.data), function (e, a) {
                                    Game.data.objects.data[a].old_hp = Game.data.objects.data[a].hp;
                                }),
                                    (Game.data.objects.data = jQuery.extend(!0, Game.data.objects.data, gmcp_json)),
                                    clearTimeout(Game.panel_chars_timeout),
                                    (Game.panel_chars_timeout = setTimeout(function () {
                                        Game.refresh_panel_chars();
                                    }, 10)));
                        }
                }
            }
        },
    },
    Conf = {
        options: {
            theme_type: [
                { Text: "Black", Id: "black" },
                { Text: "Metroblack", Id: "metroblack" },
                { Text: "Moonlight", Id: "moonlight" },
            ],
            font_type: [
                { Text: "Courier New", Id: "Courier New" },
                { Text: "Droid Sans Mono", Id: "Droidsansmono" },
                { Text: "Envy Code R", Id: "Envy Code R" },
                { Text: "Lucida Sans", Id: "Lucida Sans Typewriter" },
                { Text: "Menlo", Id: "Menlo" },
                { Text: "Monospace", Id: "Monospace" },
                { Text: "Terminus", Id: "Terminus" },
            ],
            font_size: [
                { Text: "10", Id: 10 },
                { Text: "11", Id: 11 },
                { Text: "12", Id: 12 },
                { Text: "13", Id: 13 },
                { Text: "14", Id: 14 },
                { Text: "15", Id: 15 },
                { Text: "16", Id: 16 },
                { Text: "17", Id: 17 },
                { Text: "18", Id: 18 },
            ],
            logging: [
                { Text: "WĹÄczone", Id: !0 },
                { Text: "WyĹÄczone", Id: !1 },
            ],
            logging_times: [
                { Text: "WĹÄczone", Id: !0 },
                { Text: "WyĹÄczone", Id: !1 },
            ],
            output_times: [
                { Text: "WĹÄczone", Id: !0 },
                { Text: "WyĹÄczone", Id: !1 },
            ],
            output_limit: [
                { Text: "20", Id: 20 },
                { Text: "50", Id: 50 },
                { Text: "100", Id: 100 },
                { Text: "200", Id: 200 },
                { Text: "400", Id: 400 },
            ],
            output_command_echo: [
                { Text: "WĹÄczone", Id: !0 },
                { Text: "WyĹÄczone", Id: !1 },
            ],
            background_map: [
                { Text: "WĹÄczona", Id: !0 },
                { Text: "WyĹÄczona", Id: !1 },
            ],
            history_limit: [
                { Text: "0", Id: 0 },
                { Text: "10", Id: 10 },
                { Text: "20", Id: 20 },
                { Text: "50", Id: 50 },
                { Text: "100", Id: 100 },
            ],
            input_echo: [
                { Text: "Zostaje zaznaczona", Id: 1 },
                { Text: "Znika", Id: 2 },
            ],
            input_split: [
                { Text: "Brak", Id: 0 },
                { Text: ";", Id: 59 },
                { Text: "|", Id: 124 },
                { Text: "\\", Id: 92 },
                { Text: "`", Id: 96 },
            ],
            input_variables: [
                { Text: "WĹÄczone", Id: !0 },
                { Text: "WyĹÄczone", Id: !1 },
            ],
            blocking_variables: [
                { Text: "WĹÄczone", Id: !0 },
                { Text: "WyĹÄczone", Id: !1 },
            ],
            panel_chars_order: [
                { Text: "Wedle wejĹcia na lokacje", Id: 1 },
                { Text: "Wedle grup postaci", Id: 2 },
            ],
            touch_panels: [
                { Text: "Klawiatura", Id: "keyboard" },
                { Text: "Kierunki", Id: "directions" },
                { Text: "Postaci", Id: "chars" },
                { Text: "Stan", Id: "status" },
                { Text: "Przyciski", Id: "buttons" },
            ],
            actions_popup_position: [
                { Text: "Po zewnÄtrznej z lewej", Id: 1 },
                { Text: "Po zewnÄtrznej z prawej", Id: 2 },
                { Text: "Po wewnÄtrznej z lewej", Id: 3 },
                { Text: "Po wewnÄtrznej z prawej", Id: 4 },
                { Text: "Pod postaciÄ", Id: 5 },
            ],
            side_buttons_position: [
                { Text: "Po wewnÄtrznej", Id: 1 },
                { Text: "Po zewnÄtrznej", Id: 2 },
            ],
            panels: [
                { Text: "GĂłrny", Id: "top", Css_Icon: "fa-caret-square-o-up" },
                { Text: "Dolny", Id: "bottom", Css_Icon: "fa-caret-square-o-down" },
                { Text: "Prawy", Id: "right", Css_Icon: "fa-caret-square-o-right" },
                { Text: "Lewy", Id: "left", Css_Icon: "fa-caret-square-o-left" },
            ],
            panel_objects: [
                { Text: "Mapa", Id: "mapa", Progressbar: !1, Html_Id: "#minimap_output" },
                { Text: "Kierunki", Id: "kierunki", Progressbar: !1, Html_Id: "#directions" },
                { Text: "Postaci", Id: "postaci", Progressbar: !1, Html_Id: "#panel_chars" },
                { Text: "Kondycja", Id: "kondycja", Progressbar: !0, Html_Id: "#health_bar" },
                { Text: "Mana", Id: "mana", Progressbar: !0, Html_Id: "#mana_bar" },
                { Text: "ZmÄczenie", Id: "zmeczenie", Progressbar: !0, Html_Id: "#fatigue_bar" },
                { Text: "ObciÄĹźenie", Id: "obciazenie", Progressbar: !0, Html_Id: "#encumbrance_bar" },
                { Text: "Panika", Id: "panika", Progressbar: !0, Html_Id: "#panic_bar" },
                { Text: "GĹĂłd", Id: "glod", Progressbar: !0, Html_Id: "#stuffed_bar" },
                { Text: "Pragnienie", Id: "pragnienie", Progressbar: !0, Html_Id: "#soaked_bar" },
                { Text: "Upicie", Id: "upicie", Progressbar: !0, Html_Id: "#intox_bar" },
                { Text: "Kac", Id: "kac", Progressbar: !0, Html_Id: "#headache_bar" },
                { Text: "PostÄpy", Id: "postepy", Progressbar: !0, Html_Id: "#exp_bar" },
                { Text: "Forma", Id: "forma", Progressbar: !0, Html_Id: "#form_bar" },
            ],
            macros: [
                { Text: "PAGE UP", Id: "33" },
                { Text: "PAGE DOWN", Id: "34" },
                { Text: "END", Id: "35" },
                { Text: "HOME", Id: "36" },
                { Text: "INSERT", Id: "45" },
                { Text: "NUM 0", Id: "96" },
                { Text: "NUM 1", Id: "97" },
                { Text: "NUM 2", Id: "98" },
                { Text: "NUM 3", Id: "99" },
                { Text: "NUM 4", Id: "100" },
                { Text: "NUM 5", Id: "101" },
                { Text: "NUM 6", Id: "102" },
                { Text: "NUM 7", Id: "103" },
                { Text: "NUM 8", Id: "104" },
                { Text: "NUM 9", Id: "105" },
                { Text: "*", Id: "106" },
                { Text: "+", Id: "107" },
                { Text: "-", Id: "109" },
                { Text: "NUM .", Id: "110" },
                { Text: "/", Id: "111" },
                { Text: "F1", Id: "112" },
                { Text: "F2", Id: "113" },
                { Text: "F3", Id: "114" },
                { Text: "F4", Id: "115" },
                { Text: "F5", Id: "116" },
                { Text: "F6", Id: "117" },
                { Text: "F7", Id: "118" },
                { Text: "F8", Id: "119" },
                { Text: "F9", Id: "120" },
                { Text: "F10", Id: "121" },
                { Text: "F11", Id: "122" },
                { Text: "F12", Id: "123" },
            ],
            sounds: [
                { Text: "Alarm", Id: 1, Sound: $("<audio></audio>").prop("src", "sounds/alarm.mp3").get(0) },
                { Text: "Bip", Id: 2, Sound: $("<audio></audio>").prop("src", "sounds/beep.mp3").get(0) },
                { Text: "Buzz", Id: 3, Sound: $("<audio></audio>").prop("src", "sounds/buzz.mp3").get(0) },
                { Text: "Gong", Id: 4, Sound: $("<audio></audio>").prop("src", "sounds/gong.mp3").get(0) },
                { Text: "Pager", Id: 5, Sound: $("<audio></audio>").prop("src", "sounds/pager.mp3").get(0) },
                { Text: "Syrena", Id: 6, Sound: $("<audio></audio>").prop("src", "sounds/siren.mp3").get(0) },
            ],
            patterns_replacement_flag: [
                { Text: "ZmieĹ tekst", Id: 1 },
                { Text: "Nie zmieniaj tekstu", Id: 2 },
            ],
            patterns_color_flag: [
                { Text: "Koloruj tekst", Id: 1 },
                { Text: "Nie koloruj tekstu", Id: 2 },
            ],
            patterns_sound_flag: [
                { Text: "WywoĹaj dĹşwiÄk", Id: 1 },
                { Text: "Nie wywoĹuj dĹşwiÄku", Id: 2 },
            ],
            char_type: [
                { Text: "Twoja postaÄ", Id: "avatar", Css_Icon: "fa-male", Color_Order: 7 },
                { Text: "DruĹźyna", Id: "team", Css_Icon: "fa-user", Color_Order: 6 },
                { Text: "Wrogowie", Id: "enemy", Css_Icon: "fa-warning", Color_Order: 3 },
                { Text: "Neutralni", Id: "neutral", Css_Icon: "fa-question-circle-o", Color_Order: 8 },
                { Text: "PrzywĂłdca druzyny", Id: "team_leader", Css_Icon: "fa-users", Color_Order: 5 },
                { Text: "Przeciwnik", Id: "avatar_target", Css_Icon: "fa-bullseye", Color_Order: 2 },
                { Text: "Cel obrony", Id: "defense_target", Css_Icon: "fa-shield", Color_Order: 4 },
                { Text: "Cel ataku", Id: "attack_target", Css_Icon: "fa-crosshairs", Color_Order: 1 },
            ],
            team_role: [
                { Text: "Rola bez znaczenia", Id: "avatar", Css_Icon: "fa-male" },
                { Text: "CzĹonek druĹźyny", Id: "team", Css_Icon: "fa-user" },
                { Text: "PrzywĂłdca druzyny", Id: "team_leader", Css_Icon: "fa-users" },
            ],
        },
        defaults: {
            theme_type: "metroblack",
            font_type: "Droidsansmono",
            font_size: 13,
            logging: !0,
            logging_times: !0,
            output_times: !1,
            output_limit: 100,
            output_command_echo: !0,
            background_map: !1,
            history_limit: 20,
            input_echo: 1,
            input_split: 0,
            input_variables: !1,
            blocking_variables: !0,
            panel_chars_order: 1,
            actions_popup_position: 1,
            side_buttons_positions: 1,
            touch_panels: ["keyboard", "directions", "chars", "status", "buttons"],
            panels: { right: ["mapa", "kierunki", "postaci"], bottom: ["kondycja", "mana", "zmeczenie"] },
            extra_history: [
                "+cechy",
                "+kondycja",
                "+mana",
                "+manewr",
                "+staz",
                "+zmeczenie",
                "cechy",
                "czas",
                "daj",
                "dobadz",
                "dolacz",
                "druzyna",
                "dzwignij",
                "ekwipunek",
                "email",
                "forma",
                "glod",
                "haslo",
                "jezyki",
                "kolory",
                "kondycja",
                "kto",
                "mana",
                "obciazenie",
                "obejrzyj",
                "ocen",
                "odbezpiecz",
                "odloz",
                "odmien",
                "odpowiedz",
                "opcje",
                "opusc",
                "ostatnio",
                "panika",
                "pokaz",
                "policz",
                "poloz",
                "porownaj",
                "porzuc",
                "postepy",
                "poziomy",
                "pragnienie",
                "przecisnij",
                "przeczytaj",
                "przedstaw",
                "przemknij",
                "przeskocz",
                "przestan",
                "przeszukaj",
                "przetrwaja",
                "przyjrzyj",
                "przytrocz",
                "przyzwij",
                "relacje",
                "rozkaz",
                "schowaj",
                "spojrz",
                "stan",
                "system",
                "szukaj",
                "trop",
                "ujawnij",
                "ukryj",
                "umiejetnosci",
                "wejdz",
                "wespnij",
                "wesprzyj",
                "wez",
                "wiedza",
                "wiesci",
                "wloz",
                "wycofaj",
                "zabezpiecz",
                "zabij",
                "zakoncz",
                "zaloz",
                "zapal",
                "zapamietani",
                "zapros",
                "zapytaj",
                "zaskocz",
                "zaslon",
                "zdejmij",
                "zerknij",
                "zgas",
                "zglos",
                "zjedz",
                "zmeczenie",
            ],
            macros: {
                96: { general: "idz" },
                97: { general: "sw", alt: "przemknij sw", ctrl: "przemknij z druzyna sw" },
                98: { general: "s", alt: "przemknij s", ctrl: "przemknij z druzyna s" },
                99: { general: "se", alt: "przemknij se", ctrl: "przemknij z druzyna se" },
                100: { general: "w", alt: "przemknij w", ctrl: "przemknij z druzyna w" },
                101: { general: "zerknij" },
                102: { general: "e", alt: "przemknij e", ctrl: "przemknij z druzyna e" },
                103: { general: "nw", alt: "przemknij nw", ctrl: "przemknij z druzyna nw" },
                104: { general: "n", alt: "przemknij n", ctrl: "przemknij z druzyna n" },
                105: { general: "ne", alt: "przemknij ne", ctrl: "przemknij z druzyna ne" },
                107: { general: "d", alt: "przemknij d", ctrl: "przemknij z druzyna d" },
                109: { general: "u", alt: "przemknij u", ctrl: "przemknij z druzyna u" },
                110: { general: "wyjscie", alt: "przemknij wyjscie", ctrl: "przemknij z druzyna wyjscie" },
            },
            buttons: [
                { name: "spĂłjrz", replacement: "spojrz", panel: "bottom" },
                { name: "idĹş", replacement: "idz", panel: "bottom" },
                { name: "powiedz", replacement: "powiedz %%", panel: "bottom" },
                { name: "krzyknij", replacement: "krzyknij %%", panel: "bottom" },
                { name: "przedstaw siÄ", replacement: "przedstaw sie", panel: "bottom" },
                { name: "otwĂłrz bramÄ", replacement: "uderz we wrota", panel: "bottom" },
                { name: "zakoĹcz", replacement: "zakoncz", panel: "left" },
                { name: "system", replacement: "system", panel: "left" },
                { name: "opcje", replacement: "opcje", panel: "left" },
                { name: "stan", replacement: "stan", panel: "left" },
                { name: "ekwipunek", replacement: "ekwipunek", panel: "left" },
                { name: "cechy", replacement: "cechy", panel: "left" },
                { name: "umiejÄtnoĹci", replacement: "umiejetnosci", panel: "left" },
                { name: "jÄzyki", replacement: "jezyki", panel: "left" },
                { name: "wiedza", replacement: "wiedza", panel: "left" },
                { name: "odpornoĹci", replacement: "odpornosci", panel: "left" },
                { name: "relacje", replacement: "relacje", panel: "left" },
                { name: "zapamietani", replacement: "zapamietani", panel: "left" },
                { name: "kto", replacement: "kto", panel: "left" },
            ],
            actions: [
                { name: "zasĹoĹ przed", replacement: "zaslon przed $$", char_type: ["enemy"], team_role: "avatar" },
                { name: "zabij", replacement: "zabij $$", char_type: ["enemy", "neutral"], team_role: "avatar" },
                { name: "zasĹoĹ", replacement: "zaslon $$", char_type: ["team"], team_role: "avatar" },
                { name: "wesprzyj", replacement: "wesprzyj $$", char_type: ["team"], team_role: "avatar" },
                { name: "rozkaz ataku", replacement: "rozkaz wszystkim zaatakowac $$", char_type: ["enemy", "neutral"], team_role: "team_leader" },
                { name: "rozkaz zasĹony", replacement: "rozkaz wszystkim zaslonic $$", char_type: ["avatar", "team"], team_role: "team_leader" },
                { name: "cel ataku", replacement: "wskaz $$ jako cel ataku", char_type: ["enemy"], team_role: "team_leader" },
                { name: "cel obrony", replacement: "wskaz $$ jako cel obrony", char_type: ["avatar", "team"], team_role: "team_leader" },
                { name: "obejrzyj", replacement: "obejrzyj $$", char_type: [], team_role: "avatar" },
                { name: "powiedz do", replacement: "powiedz do $$ %%", char_type: [], team_role: "avatar" },
                { name: "szepnij", replacement: "szepnij $$ %%", char_type: ["team", "enemy", "neutral"], team_role: "avatar" },
                { name: "wskaĹź", replacement: "wskaz $$", char_type: [], team_role: "avatar" },
                { name: "porĂłwnaj siÄ", replacement: "porownaj sile z $$\nporownaj zrecznosc z $$\nporownaj wytrzymalosc z $$", char_type: ["team", "enemy", "neutral"], team_role: "avatar" },
                { name: "stwĂłrz druĹźynÄ", replacement: "zapros $$", char_type: ["neutral"], team_role: "avatar" },
                { name: "porzuÄ druĹźynÄ", replacement: "porzuc druzyne", char_type: ["team_leader"], team_role: "team" },
                { name: "porzuÄ", replacement: "porzuc $$", char_type: ["team"], team_role: "team_leader" },
                { name: "przekaĹź druĹźynÄ", replacement: "przekaz prowadzenie $$", char_type: ["team"], team_role: "team_leader" },
                { name: "rozwiÄĹź druĹźynÄ", replacement: "porzuc druzyne", char_type: ["avatar"], team_role: "team_leader" },
                { name: "zaproĹ", replacement: "zapros $$", char_type: ["neutral"], team_role: "team_leader" },
                { name: "doĹÄcz do", replacement: "dolacz do $$", char_type: ["neutral"], team_role: "avatar" },
            ],
            color_codes: {
                panel_chars: { avatar: "#075f3b", team: "#33B3CC", enemy: "#CC9933", neutral: "#0f9a29", team_leader: "#3366CC", avatar_target: "#CC4D33", defense_target: "#4D33CC", attack_target: "#CC3366" },
                progressbars: {
                    kondycja: "#A51C30",
                    mana: "#545AA7",
                    zmeczenie: "#008000",
                    obciazenie: "#696969",
                    panika: "#696969",
                    glod: "#696969",
                    pragnienie: "#696969",
                    upicie: "#696969",
                    kac: "#696969",
                    postepy: "#696969",
                    forma: "#696969",
                },
                xterm: [
                    "#000000",
                    "#800000",
                    "#008000",
                    "#808000",
                    "#000080",
                    "#800080",
                    "#008080",
                    "#c0c0c0",
                    "#808080",
                    "#ff0000",
                    "#00ff00",
                    "#ffff00",
                    "#0000ff",
                    "#ff00ff",
                    "#00ffff",
                    "#ffffff",
                    "#000000",
                    "#00005f",
                    "#000087",
                    "#0000af",
                    "#0000df",
                    "#0000ff",
                    "#005f00",
                    "#005f5f",
                    "#005f87",
                    "#005faf",
                    "#005fdf",
                    "#005fff",
                    "#008700",
                    "#00875f",
                    "#008787",
                    "#0087af",
                    "#0087df",
                    "#0087ff",
                    "#00af00",
                    "#00af5f",
                    "#00af87",
                    "#00afaf",
                    "#00afdf",
                    "#00afff",
                    "#00df00",
                    "#00df5f",
                    "#00df87",
                    "#00dfaf",
                    "#00dfdf",
                    "#00dfff",
                    "#00ff00",
                    "#00ff5f",
                    "#00ff87",
                    "#00ffaf",
                    "#00ffdf",
                    "#00ffff",
                    "#5f0000",
                    "#5f005f",
                    "#5f0087",
                    "#5f00af",
                    "#5f00df",
                    "#5f00ff",
                    "#5f5f00",
                    "#5f5f5f",
                    "#5f5f87",
                    "#5f5faf",
                    "#5f5fdf",
                    "#5f5fff",
                    "#5f8700",
                    "#5f875f",
                    "#5f8787",
                    "#5f87af",
                    "#5f87df",
                    "#5f87ff",
                    "#5faf00",
                    "#5faf5f",
                    "#5faf87",
                    "#5fafaf",
                    "#5fafdf",
                    "#5fafff",
                    "#5fdf00",
                    "#5fdf5f",
                    "#5fdf87",
                    "#5fdfaf",
                    "#5fdfdf",
                    "#5fdfff",
                    "#5fff00",
                    "#5fff5f",
                    "#5fff87",
                    "#5fffaf",
                    "#5fffdf",
                    "#5fffff",
                    "#870000",
                    "#87005f",
                    "#870087",
                    "#8700af",
                    "#8700df",
                    "#8700ff",
                    "#875f00",
                    "#875f5f",
                    "#875f87",
                    "#875faf",
                    "#875fdf",
                    "#875fff",
                    "#878700",
                    "#87875f",
                    "#878787",
                    "#8787af",
                    "#8787df",
                    "#8787ff",
                    "#87af00",
                    "#87af5f",
                    "#87af87",
                    "#87afaf",
                    "#87afdf",
                    "#87afff",
                    "#87df00",
                    "#87df5f",
                    "#87df87",
                    "#87dfaf",
                    "#87dfdf",
                    "#87dfff",
                    "#87ff00",
                    "#87ff5f",
                    "#87ff87",
                    "#87ffaf",
                    "#87ffdf",
                    "#87ffff",
                    "#af0000",
                    "#af005f",
                    "#af0087",
                    "#af00af",
                    "#af00df",
                    "#af00ff",
                    "#af5f00",
                    "#af5f5f",
                    "#af5f87",
                    "#af5faf",
                    "#af5fdf",
                    "#af5fff",
                    "#af8700",
                    "#af875f",
                    "#af8787",
                    "#af87af",
                    "#af87df",
                    "#af87ff",
                    "#afaf00",
                    "#afaf5f",
                    "#afaf87",
                    "#afafaf",
                    "#afafdf",
                    "#afafff",
                    "#afdf00",
                    "#afdf5f",
                    "#afdf87",
                    "#afdfaf",
                    "#afdfdf",
                    "#afdfff",
                    "#afff00",
                    "#afff5f",
                    "#afff87",
                    "#afffaf",
                    "#afffdf",
                    "#afffff",
                    "#df0000",
                    "#df005f",
                    "#df0087",
                    "#df00af",
                    "#df00df",
                    "#df00ff",
                    "#df5f00",
                    "#df5f5f",
                    "#df5f87",
                    "#df5faf",
                    "#df5fdf",
                    "#df5fff",
                    "#df8700",
                    "#df875f",
                    "#df8787",
                    "#df87af",
                    "#df87df",
                    "#df87ff",
                    "#dfaf00",
                    "#dfaf5f",
                    "#dfaf87",
                    "#dfafaf",
                    "#dfafdf",
                    "#dfafff",
                    "#dfdf00",
                    "#dfdf5f",
                    "#dfdf87",
                    "#dfdfaf",
                    "#dfdfdf",
                    "#dfdfff",
                    "#dfff00",
                    "#dfff5f",
                    "#dfff87",
                    "#dfffaf",
                    "#dfffdf",
                    "#dfffff",
                    "#ff0000",
                    "#ff005f",
                    "#ff0087",
                    "#ff00af",
                    "#ff00df",
                    "#ff00ff",
                    "#ff5f00",
                    "#ff5f5f",
                    "#ff5f87",
                    "#ff5faf",
                    "#ff5fdf",
                    "#ff5fff",
                    "#ff8700",
                    "#ff875f",
                    "#ff8787",
                    "#ff87af",
                    "#ff87df",
                    "#ff87ff",
                    "#ffaf00",
                    "#ffaf5f",
                    "#ffaf87",
                    "#ffafaf",
                    "#ffafdf",
                    "#ffafff",
                    "#ffdf00",
                    "#ffdf5f",
                    "#ffdf87",
                    "#ffdfaf",
                    "#ffdfdf",
                    "#ffdfff",
                    "#ffff00",
                    "#ffff5f",
                    "#ffff87",
                    "#ffffaf",
                    "#ffffdf",
                    "#ffffff",
                    "#080808",
                    "#121212",
                    "#1c1c1c",
                    "#262626",
                    "#303030",
                    "#3a3a3a",
                    "#444444",
                    "#4e4e4e",
                    "#585858",
                    "#606060",
                    "#666666",
                    "#767676",
                    "#808080",
                    "#8a8a8a",
                    "#949494",
                    "#9e9e9e",
                    "#a8a8a8",
                    "#b2b2b2",
                    "#bcbcbc",
                    "#c6c6c6",
                    "#d0d0d0",
                    "#dadada",
                    "#e4e4e4",
                    "#eeeeee",
                ],
                ansi: { bright: ["#555555", "#ff5555", "#55ff55", "#ffff55", "#5555ff", "#ff55ff", "#55ffff", "#ffffff"], dark: ["#000000", "#bb0000", "#00bb00", "#bbbb00", "#0000bb", "#bb00bb", "#00bbbb", "#bbbbbb"] },
            },
        },
        data: {},
        check: function (e, a) {
            $.isPlainObject(e) || (e = {}), !0 !== a && (a = !1);
            var t = jQuery.extend(!0, {}, Conf.data),
                o = [],
                n = function (a) {
                    var n = Conf.options[a],
                        i = e[a],
                        s = !1;
                    $.each(n, function (e, a) {
                        if (a.Id === i) return (s = !0), !1;
                    }),
                        void 0 === i ? (t[a] = Conf.defaults[a]) : s ? (t[a] = i) : ((t[a] = Conf.defaults[a]), o.push(a));
                };
            if (
                (n("theme_type"),
                    n("font_type"),
                    n("font_size"),
                    n("logging"),
                    n("logging_times"),
                    n("output_times"),
                    n("output_limit"),
                    n("output_command_echo"),
                    n("background_map"),
                    n("history_limit"),
                    n("input_echo"),
                    n("input_split"),
                    n("input_variables"),
                    n("blocking_variables"),
                    n("panel_chars_order"),
                    n("actions_popup_position"),
                    n("side_buttons_position"),
                    Array.isArray(e.touch_panels))
            ) {
                var i = [],
                    s = [];
                $.each(Conf.options.touch_panels, function (e, a) {
                    s.push(a.Id);
                }),
                    (t.touch_panels = $.grep(e.touch_panels, function (e, a) {
                        return "string" == typeof e && s.indexOf(e) > -1 && -1 == i.indexOf(e) ? (i.push(e), !0) : (o.push("touch_panels[" + a + "]"), !1);
                    }));
            } else void 0 !== e.touch_panels ? ((t.touch_panels = []), o.push("touch_panels")) : (t.touch_panels = jQuery.extend(!0, [], Conf.defaults.touch_panels));
            if (
                (Array.isArray(e.extra_history)
                    ? ((i = []),
                        (t.extra_history = $.grep(e.extra_history, function (e, a) {
                            return "string" == typeof e && e.length && -1 == i.indexOf(e) ? (i.push(e), !0) : (o.push("extra_history[" + a + "]"), !1);
                        })))
                    : void 0 !== e.extra_history
                        ? ((t.extra_history = []), o.push("extra_history"))
                        : (t.extra_history = jQuery.extend(!0, [], Conf.defaults.extra_history)),
                $.isPlainObject(e.color_codes) &&
                $.isPlainObject(e.color_codes.panel_chars) &&
                $.isPlainObject(e.color_codes.progressbars) &&
                $.isPlainObject(e.color_codes.ansi) &&
                Array.isArray(e.color_codes.ansi.bright) &&
                Array.isArray(e.color_codes.ansi.dark))
            ) {
                (t.color_codes = {}), (t.color_codes.panel_chars = {}), (t.color_codes.progressbars = {}), (t.color_codes.ansi = {}), (t.color_codes.ansi.bright = []), (t.color_codes.ansi.dark = []);
                var r = [],
                    l = [];
                $.each(Conf.options.char_type, function (e, a) {
                    r.push(a.Id);
                }),
                    $.each(Conf.options.panel_objects, function (e, a) {
                        a.Progressbar && l.push(a.Id);
                    }),
                    r.length != Object.keys(e.color_codes.panel_chars).length
                        ? (o.push("color_codes.panel_chars"), (t.color_codes.panel_chars = jQuery.extend(!0, {}, Conf.defaults.color_codes.panel_chars)))
                        : $.each(r, function (a, n) {
                            var i = e.color_codes.panel_chars[n];
                            "string" == typeof i && /^#(?:[A-Fa-f0-9]{3}){1,2}$/.test(i)
                                ? (t.color_codes.panel_chars[n] = i)
                                : ((t.color_codes.panel_chars[n] = Conf.defaults.color_codes.panel_chars[n]), o.push("color_codes.panel_chars[" + a + "]"));
                        }),
                    l.length != Object.keys(e.color_codes.progressbars).length
                        ? (o.push("color_codes.progressbars"), (t.color_codes.progressbars = jQuery.extend(!0, {}, Conf.defaults.color_codes.progressbars)))
                        : $.each(l, function (a, n) {
                            var i = e.color_codes.progressbars[n];
                            "string" == typeof i && /^#(?:[A-Fa-f0-9]{3}){1,2}$/.test(i)
                                ? (t.color_codes.progressbars[n] = i)
                                : ((t.color_codes.progressbars[n] = Conf.defaults.color_codes.progressbars[n]), o.push("color_codes.progressbars[" + a + "]"));
                        }),
                    Conf.defaults.color_codes.ansi.bright.length != e.color_codes.ansi.bright.length
                        ? (o.push("color_codes.ansi.bright"), (t.color_codes.ansi.bright = jQuery.extend(!0, [], Conf.defaults.color_codes.ansi.bright)))
                        : $.each(Conf.defaults.color_codes.ansi.bright, function (a, n) {
                            var i = e.color_codes.ansi.bright[a];
                            "string" == typeof i && /^#(?:[A-Fa-f0-9]{3}){1,2}$/.test(i)
                                ? t.color_codes.ansi.bright.push(i)
                                : (t.color_codes.ansi.bright.push(Conf.defaults.color_codes.ansi.bright[a]), o.push("color_codes.ansi.bright[" + a + "]"));
                        }),
                    Conf.defaults.color_codes.ansi.dark.length != e.color_codes.ansi.dark.length
                        ? (o.push("color_codes.ansi.dark"), (t.color_codes.ansi.dark = jQuery.extend(!0, [], Conf.defaults.color_codes.ansi.dark)))
                        : $.each(Conf.defaults.color_codes.ansi.dark, function (a, n) {
                            var i = e.color_codes.ansi.dark[a];
                            "string" == typeof i && /^#(?:[A-Fa-f0-9]{3}){1,2}$/.test(i)
                                ? t.color_codes.ansi.dark.push(i)
                                : (t.color_codes.ansi.dark.push(Conf.defaults.color_codes.ansi.dark[a]), o.push("color_codes.ansi.dark[" + a + "]"));
                        });
            } else
                void 0 !== e.panels && o.push("color_codes"),
                    (t.color_codes = {}),
                    (t.color_codes.panel_chars = jQuery.extend(!0, {}, Conf.defaults.color_codes.panel_chars)),
                    (t.color_codes.progressbars = jQuery.extend(!0, {}, Conf.defaults.color_codes.progressbars)),
                    (t.color_codes.ansi = jQuery.extend(!0, {}, Conf.defaults.color_codes.ansi));
            if ($.isPlainObject(e.panels) && Array.isArray(e.panels.top) && Array.isArray(e.panels.right) && Array.isArray(e.panels.bottom) && Array.isArray(e.panels.left)) {
                (i = []), (s = []);
                var d = [];
                $.each(Conf.options.panel_objects, function (e, a) {
                    s.push(a.Id), a.Progressbar && d.push(a.Id);
                }),
                    (t.panels = {}),
                    (t.panels.top = []),
                    (t.panels.right = []),
                    (t.panels.bottom = []),
                    (t.panels.left = []),
                    $.each(e.panels.top, function (e, a) {
                        "string" == typeof a && s.indexOf(a) > -1 && -1 == i.indexOf(a) && d.indexOf(a) > -1 ? (i.push(a), t.panels.top.push(a)) : o.push("panels.top[" + e + "]");
                    }),
                    $.each(e.panels.right, function (e, a) {
                        "string" == typeof a && s.indexOf(a) > -1 && -1 == i.indexOf(a) ? (i.push(a), t.panels.right.push(a)) : o.push("panels.right[" + e + "]");
                    }),
                    $.each(e.panels.bottom, function (e, a) {
                        "string" == typeof a && s.indexOf(a) > -1 && -1 == i.indexOf(a) && d.indexOf(a) > -1 ? (i.push(a), t.panels.bottom.push(a)) : o.push("panels.bottom[" + e + "]");
                    }),
                    $.each(e.panels.left, function (e, a) {
                        "string" == typeof a && s.indexOf(a) > -1 && -1 == i.indexOf(a) ? (i.push(a), t.panels.left.push(a)) : o.push("panels.left[" + e + "]");
                    });
            } else
                void 0 !== e.panels
                    ? ((t.panels = {}), (t.panels.top = []), (t.panels.right = []), (t.panels.bottom = []), (t.panels.left = []), o.push("panels"))
                    : ((t.panels = jQuery.extend(!0, {}, Conf.defaults.panels)),
                    Array.isArray(t.panels.top) || (t.panels.top = []),
                    Array.isArray(t.panels.right) || (t.panels.right = []),
                    Array.isArray(t.panels.bottom) || (t.panels.bottom = []),
                    Array.isArray(t.panels.left) || (t.panels.left = []));
            if (
                ($.isPlainObject(e.aliases)
                    ? ((t.aliases = {}),
                        $.each(Object.keys(e.aliases), function (a, n) {
                            "string" == typeof n && n.length && n.length <= 15 && -1 == n.indexOf(" ") && "string" == typeof e.aliases[n] && e.aliases[n].length && e.aliases[n] != n
                                ? (t.aliases[n] = e.aliases[n])
                                : o.push("aliases[" + n + "]");
                        }))
                    : void 0 !== e.aliases
                        ? ((t.aliases = {}), o.push("aliases"))
                        : (t.aliases = jQuery.extend(!0, {}, Conf.defaults.aliases)),
                    $.isPlainObject(e.macros)
                        ? ((s = []),
                            $.each(Conf.options.macros, function (e, a) {
                                s.push(a.Id);
                            }),
                            (t.macros = {}),
                            $.isPlainObject(e.alt_macros) && $.isPlainObject(e.ctrl_macros)
                                ? $.each(s, function (a, o) {
                                    var n = {};
                                    e.macros[o] && (n.general = e.macros[o]), e.alt_macros[o] && (n.alt = e.alt_macros[o]), e.ctrl_macros[o] && (n.ctrl = e.ctrl_macros[o]), Object.keys(n).length && (t.macros[o] = n);
                                })
                                : $.each(Object.keys(e.macros), function (a, n) {
                                    "string" == typeof n &&
                                    s.indexOf(n) > -1 &&
                                    $.isPlainObject(e.macros[n]) &&
                                    (void 0 === e.macros[n].general || ("string" == typeof e.macros[n].general && e.macros[n].general.length)) &&
                                    (void 0 === e.macros[n].alt || ("string" == typeof e.macros[n].alt && e.macros[n].alt.length)) &&
                                    (void 0 === e.macros[n].ctrl || ("string" == typeof e.macros[n].ctrl && e.macros[n].ctrl.length))
                                        ? (t.macros[n] = e.macros[n])
                                        : o.push("macros[" + n + "]");
                                }))
                        : void 0 !== e.macros
                            ? ((t.macros = {}), o.push("macros"))
                            : (t.macros = jQuery.extend(!0, {}, Conf.defaults.macros)),
                    Array.isArray(e.buttons))
            ) {
                var c = [];
                i = [];
                $.each(Conf.options.panels, function (e, a) {
                    c.push(a.Id);
                }),
                    (t.buttons = $.grep(e.buttons, function (e, a) {
                        return $.isPlainObject(e) &&
                        delete e.name &&
                        3 == Object.keys(e).length &&
                        "string" == typeof e.Name &&
                        e.Name.length &&
                        decodeURI(e.Name).toLowerCase() == decodeURI(e.Name) &&
                        decodeURI(e.Name).length <= 15 &&
                        -1 == i.indexOf(e.Name) &&
                        " " != e.Name.slice(0, 1) &&
                        " " != e.Name.slice(-1) &&
                        "string" == typeof e.Replacement &&
                        e.Replacement.length &&
                        "string" == typeof e.Panel &&
                        c.indexOf(e.Panel) > -1
                            ? (i.push(e.Name), !0)
                            : (o.push("buttons[" + a + "]"), !1);
                    }));
            } else
                void 0 !== e.buttons
                    ? ((t.buttons = []), o.push("buttons"))
                    : ((e.buttons = jQuery.extend(!0, [], Conf.defaults.buttons)),
                        (t.buttons = []),
                        $.each(e.buttons, function (e, a) {
                            var o = {};
                            (o.Name = encodeURI(a.name)), (o.Replacement = a.replacement), (o.Panel = a.panel), t.buttons.push(o);
                        }));
            if (Array.isArray(e.actions)) {
                r = [];
                var p = [];
                i = [];
                $.each(Conf.options.char_type, function (e, a) {
                    r.push(a.Id);
                }),
                    $.each(Conf.options.team_role, function (e, a) {
                        p.push(a.Id);
                    }),
                    (t.actions = $.grep(e.actions, function (e, a) {
                        return $.isPlainObject(e) &&
                        delete e.name &&
                        4 == Object.keys(e).length &&
                        "string" == typeof e.Name &&
                        e.Name.length &&
                        decodeURI(e.Name).toLowerCase() == decodeURI(e.Name) &&
                        decodeURI(e.Name).length <= 15 &&
                        -1 == i.indexOf(e.Name) &&
                        " " != e.Name.slice(0, 1) &&
                        " " != e.Name.slice(-1) &&
                        "string" == typeof e.Replacement &&
                        e.Replacement.length &&
                        p.indexOf(e.Team_Role) > -1 &&
                        Array.isArray(e.Char_Type) &&
                        !e.Char_Type.filter(function (e) {
                            if (-1 == r.indexOf(e)) return !0;
                        }).length &&
                        e.Char_Type.sort()
                            ? (i.push(e.Name), !0)
                            : (o.push("actions[" + a + "]"), !1);
                    }));
            } else
                void 0 !== e.actions
                    ? ((t.actions = []), o.push("actions"))
                    : ((e.actions = jQuery.extend(!0, [], Conf.defaults.actions)),
                        (t.actions = []),
                        $.each(e.actions, function (e, a) {
                            var o = {};
                            (o.Name = encodeURI(a.name)), (o.Replacement = a.replacement), (o.Char_Type = a.char_type), (o.Team_Role = a.team_role), t.actions.push(o);
                        }));
            if (Array.isArray(e.patterns)) {
                (s = []), (i = []);
                $.each(Conf.options.sounds, function (e, a) {
                    s.push(a.Id);
                }),
                    (t.patterns = $.grep(e.patterns, function (e, a) {
                        if (
                            $.isPlainObject(e) &&
                            Object.keys(e).length >= 2 &&
                            "string" == typeof e.Regexp &&
                            -1 == i.indexOf(e.Regexp) &&
                            (void 0 === e.Replacement || "string" == typeof e.Replacement) &&
                            (void 0 === e.Color || ("string" == typeof e.Color && /^#(?:[A-Fa-f0-9]{3}){1,2}$/.test(e.Color) && ("string" != typeof e.Replacement || e.Replacement.length))) &&
                            (void 0 === e.Sound || ("number" == typeof e.Sound && s.indexOf(e.Sound) > -1))
                        ) {
                            try {
                                new RegExp(e.Regexp);
                            } catch (e) {
                                return o.push("patterns[" + a + "]"), !1;
                            }
                            return i.push(e.Regexp), !0;
                        }
                        return o.push("patterns[" + a + "]"), !1;
                    }));
            } else
                void 0 !== e.patterns
                    ? ((t.patterns = []), o.push("patterns"))
                    : Array.isArray(e.colors_regex) && Array.isArray(e.colors_color)
                        ? ((t.patterns = []),
                            $.each(e.colors_regex, function (a, o) {
                                var n = {};
                                (n.Regexp = o), (n.Color = "#" + e.colors_color[a]), t.patterns.push(n);
                            }))
                        : (t.patterns = jQuery.extend(!0, [], Conf.defaults.patterns));
            if (!a && o.length) {
                var _ = "BĹÄd w konfiguracji w wartoĹci",
                    u = o.sort().pop();
                return o.length ? (_ += "ach " + o.join(", ") + " i " + u + ".") : (_ += " " + u + "."), $("#notification_game").data("kendoNotification").error(_), !1;
            }
            return t;
        },
        encode: function (e) {
            return jQuery.extend(!0, {}, e);
        },
        refresh_conf: function () {
            var e = [];
            $.each(Conf.data.extra_history, function (a, t) {
                e.push({ Text: t, Id: t });
            }),
                (e = new kendo.data.DataSource({ data: e })),
                $("#dropdown_conf_theme").data("kendoDropDownList").value(Conf.data.theme_type),
                $("#dropdown_conf_font_type").data("kendoDropDownList").value(Conf.data.font_type),
                $("#dropdown_conf_font_size").data("kendoDropDownList").value(Conf.data.font_size),
                $("#dropdown_conf_logging").data("kendoDropDownList").value(Conf.data.logging),
                $("#dropdown_conf_logging_times").data("kendoDropDownList").value(Conf.data.logging_times),
                $("#dropdown_conf_output_times").data("kendoDropDownList").value(Conf.data.output_times),
                $("#dropdown_conf_output_limit").data("kendoDropDownList").value(Conf.data.output_limit),
                $("#dropdown_conf_output_command_echo").data("kendoDropDownList").value(Conf.data.output_command_echo),
                $("#dropdown_conf_background_map").data("kendoDropDownList").value(Conf.data.background_map),
                $("#dropdown_conf_history_limit").data("kendoDropDownList").value(Conf.data.history_limit),
                $("#dropdown_conf_input_echo").data("kendoDropDownList").value(Conf.data.input_echo),
                $("#dropdown_conf_input_split").data("kendoDropDownList").value(Conf.data.input_split),
                $("#dropdown_conf_input_variables").data("kendoDropDownList").value(Conf.data.input_variables),
                $("#dropdown_conf_blocking_variables").data("kendoDropDownList").value(Conf.data.blocking_variables),
                $("#dropdown_conf_panel_chars_order").data("kendoDropDownList").value(Conf.data.panel_chars_order),
                $("#dropdown_conf_actions_popup_position").data("kendoDropDownList").value(Conf.data.actions_popup_position),
                $("#dropdown_conf_side_buttons_position").data("kendoDropDownList").value(Conf.data.side_buttons_position),
                $("#multiselect_conf_touch_panels").data("kendoMultiSelect").value(jQuery.extend(!0, [], Conf.data.touch_panels)),
                $("#multiselect_conf_extra_history").data("kendoTagList").setDataSource(e),
                $("#multiselect_conf_extra_history").data("kendoTagList").value(jQuery.extend(!0, [], Conf.data.extra_history)),
                $("#multiselect_conf_panel_top").data("kendoMultiSelect").value(jQuery.extend(!0, [], Conf.data.panels.top)),
                $("#multiselect_conf_panel_right").data("kendoMultiSelect").value(jQuery.extend(!0, [], Conf.data.panels.right)),
                $("#multiselect_conf_panel_bottom").data("kendoMultiSelect").value(jQuery.extend(!0, [], Conf.data.panels.bottom)),
                $("#multiselect_conf_panel_left").data("kendoMultiSelect").value(jQuery.extend(!0, [], Conf.data.panels.left)),
                $("#colorpicker_conf_health_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.kondycja),
                $("#colorpicker_conf_mana_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.mana),
                $("#colorpicker_conf_fatigue_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.zmeczenie),
                $("#colorpicker_conf_encumbrance_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.obciazenie),
                $("#colorpicker_conf_panic_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.panika),
                $("#colorpicker_conf_stuffed_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.glod),
                $("#colorpicker_conf_soaked_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.pragnienie),
                $("#colorpicker_conf_intox_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.upicie),
                $("#colorpicker_conf_headache_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.kac),
                $("#colorpicker_conf_exp_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.postepy),
                $("#colorpicker_conf_form_bar").data("kendoColorPicker").value(Conf.data.color_codes.progressbars.forma),
                $("#colorpicker_conf_char_attack_target").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.attack_target),
                $("#colorpicker_conf_char_defense_target").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.defense_target),
                $("#colorpicker_conf_char_avatar_target").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.avatar_target),
                $("#colorpicker_conf_char_team_leader").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.team_leader),
                $("#colorpicker_conf_char_neutral").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.neutral),
                $("#colorpicker_conf_char_enemy").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.enemy),
                $("#colorpicker_conf_char_team").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.team),
                $("#colorpicker_conf_char_avatar").data("kendoColorPicker").value(Conf.data.color_codes.panel_chars.avatar),
                $("#colorpicker_conf_ansi_black_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[0]),
                $("#colorpicker_conf_ansi_red_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[1]),
                $("#colorpicker_conf_ansi_green_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[2]),
                $("#colorpicker_conf_ansi_yellow_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[3]),
                $("#colorpicker_conf_ansi_blue_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[4]),
                $("#colorpicker_conf_ansi_magneta_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[5]),
                $("#colorpicker_conf_ansi_cyan_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[6]),
                $("#colorpicker_conf_ansi_white_dark").data("kendoColorPicker").value(Conf.data.color_codes.ansi.dark[7]),
                $("#colorpicker_conf_ansi_black_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[0]),
                $("#colorpicker_conf_ansi_red_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[1]),
                $("#colorpicker_conf_ansi_green_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[2]),
                $("#colorpicker_conf_ansi_yellow_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[3]),
                $("#colorpicker_conf_ansi_blue_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[4]),
                $("#colorpicker_conf_ansi_magneta_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[5]),
                $("#colorpicker_conf_ansi_cyan_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[6]),
                $("#colorpicker_conf_ansi_white_bright").data("kendoColorPicker").value(Conf.data.color_codes.ansi.bright[7]),
                Conf.refresh_panel_multiselects();
        },
        refresh_aliases: function () {
            var e = [];
            $.each(Object.keys(Conf.data.aliases), function (a, t) {
                e.push({ Command: t, Replacement: Conf.data.aliases[t] });
            }),
                (e = new kendo.data.DataSource({ data: e, sort: [{ field: "Command", dir: "asc" }] })),
                $("#listview_aliases_list").data("kendoListView").setDataSource(e);
        },
        refresh_macros: function () {
            var e = [],
                a = [];
            $.each(Conf.options.macros, function (t, o) {
                var n = Conf.data.macros[o.Id];
                $.isPlainObject(n) &&
                (n.general && e.push({ Key: o.Text, Replacement: n.general, Id: o.Id, Type: "general" }),
                n.alt && e.push({ Key: "ALT " + o.Text, Replacement: n.alt, Id: o.Id, Type: "alt" }),
                n.ctrl && e.push({ Key: "CTRL " + o.Text, Replacement: n.ctrl, Id: o.Id, Type: "ctrl" })),
                    a.push({ Key: o.Text, Id: o.Id, Type: "general" }),
                    a.push({ Key: "ALT " + o.Text, Id: o.Id, Type: "alt" }),
                    a.push({ Key: "CTRL " + o.Text, Id: o.Id, Type: "ctrl" });
            }),
                (e = new kendo.data.DataSource({
                    data: e,
                    sort: [
                        { field: "Type", dir: "desc" },
                        { field: "Key", dir: "asc" },
                    ],
                })),
                (a = new kendo.data.DataSource({
                    data: a,
                    sort: [
                        { field: "Type", dir: "desc" },
                        { field: "Key", dir: "asc" },
                    ],
                })),
                $("#listview_macros_list").data("kendoListView").setDataSource(e),
                $("#dropdown_macro_key").data("kendoDropDownList").setDataSource(a);
        },
        refresh_buttons: function () {
            var e = jQuery.extend(!0, [], Conf.data.buttons);
            (e = new kendo.data.DataSource({ data: e })), $("#listview_buttons_list").data("kendoListView").setDataSource(e);
        },
        refresh_actions: function () {
            var e = jQuery.extend(!0, [], Conf.data.actions);
            (e = new kendo.data.DataSource({ data: e })), $("#listview_actions_list").data("kendoListView").setDataSource(e);
        },
        refresh_patterns: function () {
            var e = jQuery.extend(!0, [], Conf.data.patterns);
            (e = new kendo.data.DataSource({ data: e })), $("#listview_patterns_list").data("kendoListView").setDataSource(e);
        },
        refresh_export_import: function () {},
        refresh_panel_multiselects: function () {
            var e,
                a,
                t = $("#multiselect_conf_panel_top").data("kendoMultiSelect"),
                o = $("#multiselect_conf_panel_right").data("kendoMultiSelect"),
                n = $("#multiselect_conf_panel_bottom").data("kendoMultiSelect"),
                i = $("#multiselect_conf_panel_left").data("kendoMultiSelect");
            (e = {}),
                $.each(t.value(), function (a, t) {
                    e[t] = "top";
                }),
                $.each(o.value(), function (a, t) {
                    e[t] = "right";
                }),
                $.each(n.value(), function (a, t) {
                    e[t] = "bottom";
                }),
                $.each(i.value(), function (a, t) {
                    e[t] = "left";
                }),
                (a = jQuery.extend(!0, [], Conf.options.panel_objects).filter(function (a, t, o) {
                    return !0 === a.Progressbar && (void 0 === e[a.Id] || "top" == e[a.Id]);
                })),
                (a = new kendo.data.DataSource({ data: a, sort: [{ field: "Text", dir: "asc" }] })),
                t.setDataSource(a),
                (a = jQuery.extend(!0, [], Conf.options.panel_objects).filter(function (a, t, o) {
                    return void 0 === e[a.Id] || "right" == e[a.Id];
                })),
                (a = new kendo.data.DataSource({ data: a, sort: [{ field: "Text", dir: "asc" }] })),
                o.setDataSource(a),
                (a = jQuery.extend(!0, [], Conf.options.panel_objects).filter(function (a, t, o) {
                    return !0 === a.Progressbar && (void 0 === e[a.Id] || "bottom" == e[a.Id]);
                })),
                (a = new kendo.data.DataSource({ data: a, sort: [{ field: "Text", dir: "asc" }] })),
                n.setDataSource(a),
                (a = jQuery.extend(!0, [], Conf.options.panel_objects).filter(function (a, t, o) {
                    return void 0 === e[a.Id] || "left" == e[a.Id];
                })),
                (a = new kendo.data.DataSource({ data: a, sort: [{ field: "Text", dir: "asc" }] })),
                i.setDataSource(a);
        },
        refresh: function () {
            Client.set_theme(Conf.data.theme_type),
                $("#main_text_output_msg_wrapper, #logs_output_msg_wrapper, #messages_output_msg_wrapper")
                    .css("font-family", (Conf.data.font_type || "Monospace") + ", Monospace")
                    .css("font-size", (Conf.data.font_size || 16) + "px"),
                $(".panel_elem").css("transform", "none").css("order", 0).appendTo($("#panel_hidden")),
                $(".panel_button").remove(),
                $.each(Conf.data.buttons, function (e, a) {
                    $("<input></input>")
                        .prop("type", "submit")
                        .prop("value", Text.uppercase(decodeURI(a.Name)))
                        .appendTo($("#panel_buttons_" + a.Panel))
                        .attr("id", "panel_button_" + e)
                        .addClass("panel_button")
                        .addClass("button")
                        .kendoButton();
                }),
                $(".panel_button").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        if ((e.event.preventDefault(), null != Client.socket)) {
                            var a = $(this.element).attr("id");
                            if (((a = parseInt(a.substring("panel_button_".length))), !(isNaN(a) || a < 0 || Conf.data.buttons.length <= a))) {
                                var t = Conf.data.buttons[a].Replacement,
                                    o = Input.check_variables(t);
                                !1 !== o
                                    ? $.each(o.split(/\n/), function (e, a) {
                                        Input.send(a);
                                    })
                                    : Output.send(Text.style_blocked_command(Text.encode_html(t)), "command");
                            }
                        }
                    },
                }),
                $.each(Conf.options.panel_objects, function (e, a) {
                    var t,
                        o,
                        n = $(a.Html_Id);
                    if (
                        ($.each(Object.keys(Conf.data.panels), function (e, n) {
                            var i = Conf.data.panels[n].indexOf(a.Id);
                            i > -1 && ((o = n), (t = i));
                        }),
                        "string" == typeof o && (("top" == o || "bottom" == o ? $("#panel_" + o + " #panel_progressbars_" + o) : $("#panel_" + o + " #panel_elems_" + o)).append(n), n.css("order", t)),
                        !0 === a.Progressbar)
                    ) {
                        var i = $.isPlainObject(Conf.data.color_codes) ? Conf.data.color_codes.progressbars[a.Id] : "transparent";
                        n.data("kendoProgressBar").progressWrapper.css({ "background-color": i, "border-color": i });
                    }
                }),
                $(".panel_elems .progressbar .progressbar_text").css("margin-left", "0px"),
                $(".panel_elems .progressbar .progressbar_text").css("display", "block"),
                $("html").toggleClass("logging", $("html").hasClass("storage") && !0 === Conf.data.logging),
                $("html").toggleClass("logging_times", !0 === Conf.data.logging_times),
                $("html").toggleClass("output_times", !0 === Conf.data.output_times),
                $("html").toggleClass("output_command_echo", !0 === Conf.data.output_command_echo),
                $("html").toggleClass("background_map", !0 === Conf.data.background_map),
                $("html").toggleClass("panels_reversed", 1 !== Conf.data.side_buttons_position),
                $("#panel_chars").css("margin", ""),
            ($("#bottommenu_keyboard").hasClass("k-state-active") || $("#bottommenu_keyboard_overflow > a").hasClass("k-state-active")) &&
            (Conf.data.touch_panels.indexOf("keyboard") > -1 ? ($("#user_input").blur(), $("#user_input").attr("readonly", !0)) : ($("#user_input").blur(), $("#user_input").attr("readonly", !1))),
            $("html").hasClass("conf") ||
            ($("#game .loading_img").remove(),
                $("#topmenu").data("kendoToolBar").show("#topmenu_conf"),
                $("html").addClass("conf"),
                $.each(Client.msg_buffer, function (e, a) {
                    Client.read(a.data, a.type, !1);
                }),
                (Client.msg_buffer = []),
                Touch.generate_keyboard()),
                Touch.refresh(),
                Maps.refresh_position(),
                Client.resize(),
                clearTimeout(Game.panel_chars_timeout),
                (Game.panel_chars_timeout = setTimeout(function () {
                    Game.refresh_panel_chars();
                }, 10));
        },
        export_to_file: function () {
            $("html").hasClass("diskaccess") &&
            kendo.saveAs({
                dataURI: "data:text/plain;base64," + kendo.util.encodeBase64(JSON.stringify(Conf.data)),
                fileName: Text.capitalize(Game.data.char.name) + "_konfiguracja_" + kendo.toString(new Date(), "yyyy-MM-dd_HH-mm-ss") + ".json",
            });
        },
        import_from_file: function (e) {
            if ($("html").hasClass("diskaccess"))
                if (null != Client.socket)
                    if (e) {
                        try {
                            e = jQuery.parseJSON(e);
                        } catch (e) {
                            return void $("#notification_game").data("kendoNotification").error("Konfiguracja musi byÄ zapisana w formacie Json.");
                        }
                        if (!1 !== (e = Conf.check(e, !1))) {
                            var a = {};
                            (a.data = Text.compress(JSON.stringify(Conf.encode(e)))),
                                (a.md5 = md5(a.data)),
                                (a.compressed = !0),
                                !0 !== Gmcp.send("client.conf.set", JSON.stringify(a))
                                    ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                    : ((Conf.data = e), Conf.refresh());
                        }
                    } else $("#notification_game").data("kendoNotification").error("Plik z konfiguracjÄ jest pusty.");
                else $("#notification_game").data("kendoNotification").error("Wczytanie konfiguracji jest moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
        },
        generate_buttons_template: function (e) {
            var a = "fa-question-circle-o";
            return (
                $.each(Conf.options.panels, function (t, o) {
                    if (e.Panel == o.Id) return (a = o.Css_Icon), !1;
                }),
                '<span class="fa ' + Text.encode_html(a) + '"></span>'
            );
        },
        generate_actions_template: function (e) {
            var a = "";
            return (
                $.each(Conf.options.team_role, function (t, o) {
                    if (e.Team_Role == o.Id) return (a += '<span><span class="fa ' + Text.encode_html(o.Css_Icon) + '"></span></span>'), !1;
                }),
                e.Char_Type.length &&
                ((a += "<span>"),
                    $.each(e.Char_Type, function (e, t) {
                        $.each(Conf.options.char_type, function (e, o) {
                            if (t == o.Id) return (a += '<span class="fa ' + Text.encode_html(o.Css_Icon) + '"></span>'), !1;
                        });
                    }),
                    (a += "</span>")),
                    a
            );
        },
        generate_patterns_template: function (e) {
            var a,
                t = "";
            return (
                "string" == typeof e.Replacement &&
                (e.Replacement.length
                    ? (t += '<span><span class="fa fa-random"></span><span>' + Text.encode_html(e.Replacement) + "</span></span>")
                    : (t += '<span><span class="fa fa-random"></span><span class="fa fa-ban"></span></span>')),
                e.Color && (t += '<span><span class="fa fa-paint-brush"></span><span style="color:' + Text.encode_html(e.Color) + '">Abc</span></span>'),
                e.Sound &&
                ($.each(Conf.options.sounds, function (t, o) {
                    if (e.Sound == o.Id) return (a = o.Text), !1;
                }),
                    (t += '<span><span class="fa fa-music"></span><span class="capitalize">' + Text.encode_html(a) + "</span></span>")),
                    t
            );
        },
    },
    Maps = {
        element: null,
        shift: 20,
        options: {
            domains: [
                { Text: "Imperium", Domain_Id: "Imperium" },
                { Text: "Ishtar", Domain_Id: "Ishtar" },
            ],
            areas: [
                { Text: "Nuln", Filename: "Nuln", Map_Id: 13, Domain_Id: "Imperium", Position: { x: 480, y: 357 }, Order_Num: 1 },
                { Text: "Averland", Filename: "Averland", Map_Id: 15, Domain_Id: "Imperium", Position: { x: 543, y: 359 }, Order_Num: 2 },
                { Text: "Reikland", Filename: "Reikland", Map_Id: 16, Domain_Id: "Imperium", Position: { x: 430, y: 337 }, Order_Num: 3 },
                { Text: "Stirland", Filename: "Stirland", Map_Id: 17, Domain_Id: "Imperium", Position: { x: 524, y: 335 }, Order_Num: 4 },
                { Text: "Wissenland", Filename: "Wissenland", Map_Id: 18, Domain_Id: "Imperium", Position: { x: 513, y: 440 }, Order_Num: 5 },
                { Text: "Kraina Zgromadzenia", Filename: "Kraina Zgromadzenia", Map_Id: 24, Domain_Id: "Imperium", Position: { x: 582, y: 350 }, Order_Num: 6 },
                { Text: "Quenelles", Filename: "Quenelles", Map_Id: 19, Domain_Id: "Imperium", Position: { x: 398, y: 444 }, Order_Num: 7 },
                { Text: "Parravon", Filename: "Parravon", Map_Id: 20, Domain_Id: "Imperium", Position: { x: 400, y: 359 }, Order_Num: 8 },
                { Text: "Salignac", Filename: "Salignac", Map_Id: 21, Domain_Id: "Imperium", Position: { x: 402, y: 467 }, Order_Num: 9 },
                { Text: "Masyw Orcal", Filename: "Masyw Orcal", Map_Id: 36, Domain_Id: "Imperium", Position: { x: 383, y: 380 }, Order_Num: 10 },
                { Text: "PĂłĹnocna Tilea", Filename: "Polnocna Tilea", Map_Id: 7, Domain_Id: "Imperium", Position: { x: 378, y: 539 }, Order_Num: 11 },
                { Text: "Campogrotta", Filename: "Campogrotta", Map_Id: 8, Domain_Id: "Imperium", Position: { x: 385, y: 522 }, Order_Num: 12 },
                { Text: "Ebino", Filename: "Ebino", Map_Id: 10, Domain_Id: "Imperium", Position: { x: 362, y: 515 }, Order_Num: 13 },
                { Text: "Scorcio", Filename: "Scorcio", Map_Id: 11, Domain_Id: "Imperium", Position: { x: 365, y: 528 }, Order_Num: 14 },
                { Text: "Viadaza", Filename: "Viadaza", Map_Id: 9, Domain_Id: "Imperium", Position: { x: 356, y: 538 }, Order_Num: 15 },
                { Text: "Urbimo", Filename: "Urbimo", Map_Id: 12, Domain_Id: "Imperium", Position: { x: 351, y: 555 }, Order_Num: 16 },
                { Text: "Athel Loren", Filename: "Athel Loren", Map_Id: 23, Domain_Id: "Imperium", Position: { x: 438, y: 423 }, Order_Num: 17 },
                { Text: "GĂłry KraĹca Ĺwiata", Filename: "Gory Kranca Swiata", Map_Id: 4, Domain_Id: "Imperium", Position: { x: 700, y: 310 }, Order_Num: 18 },
                { Text: "Karak Kadrin", Filename: "Karak Kadrin", Map_Id: 6, Domain_Id: "Imperium", Position: { x: 712, y: 266 }, Order_Num: 19 },
                { Text: "Karak Varn", Filename: "Karak Varn", Map_Id: 5, Domain_Id: "Imperium", Position: { x: 668, y: 345 }, Order_Num: 20 },
                { Text: "Wyspa ĹlubĂłw", Filename: "Wyspa Slubow", Map_Id: 22, Domain_Id: "Imperium", Order_Num: 21 },
                { Text: "Novigrad", Filename: "Novigrad", Map_Id: 14, Domain_Id: "Ishtar", Position: { x: 365, y: 329 }, Order_Num: 1 },
                { Text: "Okolice Novigradu", Filename: "Okolice Novigradu", Map_Id: 32, Domain_Id: "Ishtar", Position: { x: 382, y: 330 }, Order_Num: 2 },
                { Text: "Oxenfurt", Filename: "Oxenfurt", Map_Id: 53, Domain_Id: "Ishtar", Position: { x: 374, y: 347 }, Order_Num: 3 },
                { Text: "Tretogor", Filename: "Tretogor", Map_Id: 49, Domain_Id: "Ishtar", Position: { x: 453, y: 306 }, Order_Num: 4 },
                { Text: "PoĹudniowa Redania", Filename: "Poludniowa Redania", Map_Id: 50, Domain_Id: "Ishtar", Position: { x: 406, y: 381 }, Order_Num: 5 },
                { Text: "Wschodnia Redania", Filename: "Wschodnia Redania", Map_Id: 52, Domain_Id: "Ishtar", Position: { x: 516, y: 365 }, Order_Num: 6 },
                { Text: "PĂłĹnocna Redania", Filename: "Polnocna Redania", Map_Id: 51, Domain_Id: "Ishtar", Position: { x: 517, y: 259 }, Order_Num: 7 },
                { Text: "Wyzima", Filename: "Wyzima", Map_Id: 46, Domain_Id: "Ishtar", Position: { x: 427, y: 425 }, Order_Num: 8 },
                { Text: "PoĹudniowa Temeria", Filename: "Poludniowa Temeria", Map_Id: 48, Domain_Id: "Ishtar", Position: { x: 392, y: 488 }, Order_Num: 9 },
                { Text: "Zachodnia Temeria", Filename: "Zachodnia Temeria", Map_Id: 47, Domain_Id: "Ishtar", Position: { x: 350, y: 419 }, Order_Num: 10 },
                { Text: "Ard Carraigh", Filename: "Ard Carraigh", Map_Id: 27, Domain_Id: "Ishtar", Position: { x: 604, y: 250 }, Order_Num: 11 },
                { Text: "Daevon", Filename: "Daevon", Map_Id: 26, Domain_Id: "Ishtar", Position: { x: 575, y: 249 }, Order_Num: 12 },
                { Text: "PoĹudniowe Kaedwen", Filename: "Poludniowe Kaedwen", Map_Id: 31, Domain_Id: "Ishtar", Position: { x: 681, y: 318 }, Order_Num: 13 },
                { Text: "Aedirn", Filename: "Aedirn", Map_Id: 28, Domain_Id: "Ishtar", Position: { x: 688, y: 454 }, Order_Num: 14 },
                { Text: "Hagge", Filename: "Hagge", Map_Id: 25, Domain_Id: "Ishtar", Position: { x: 568, y: 415 }, Order_Num: 15 },
                { Text: "GĂłry Sine", Filename: "Gory Sine", Map_Id: 54, Domain_Id: "Ishtar", Position: { x: 807, y: 443 }, Order_Num: 16 },
                { Text: "Zachodni Mahakam", Filename: "Zachodni Mahakam", Map_Id: 41, Domain_Id: "Ishtar", Position: { x: 503, y: 447 }, Order_Num: 17 },
                { Text: "Wschodni Mahakam", Filename: "Wschodni Mahakam", Map_Id: 42, Domain_Id: "Ishtar", Position: { x: 563, y: 480 }, Order_Num: 18 },
                { Text: "PoĹudniowy Mahakam", Filename: "Poludniowy Mahakam", Map_Id: 40, Domain_Id: "Ishtar", Position: { x: 529, y: 496 }, Order_Num: 19 },
                { Text: "Twierdza pod GĂłrÄ Carbon", Filename: "Twierdza pod Gora Carbon", Map_Id: 43, Domain_Id: "Ishtar", Position: { x: 532, y: 462 }, Order_Num: 20 },
                { Text: "Lyria i Rivia", Filename: "Lyria i Rivia", Map_Id: 44, Domain_Id: "Ishtar", Position: { x: 595, y: 546 }, Order_Num: 21 },
                { Text: "Scala", Filename: "Scala", Map_Id: 45, Domain_Id: "Ishtar", Position: { x: 646, y: 588 }, Order_Num: 22 },
                { Text: "Brugge", Filename: "Brugge", Map_Id: 38, Domain_Id: "Ishtar", Position: { x: 329, y: 530 }, Order_Num: 23 },
                { Text: "Verden", Filename: "Verden", Map_Id: 39, Domain_Id: "Ishtar", Position: { x: 229, y: 579 }, Order_Num: 24 },
                { Text: "Val'kare", Filename: "Val'kare", Map_Id: 37, Domain_Id: "Ishtar", Order_Num: 25 },
                { Text: "Ard Skellig", Filename: "Ard Skellig", Map_Id: 33, Domain_Id: "Ishtar", Position: { x: 40, y: 507 }, Order_Num: 26 },
                { Text: "PozostaĹe wyspy Skellige", Filename: "Pozostale wyspy Skellige", Map_Id: 34, Domain_Id: "Ishtar", Position: { x: 49, y: 480 }, Order_Num: 27 },
                { Text: "Baccala", Filename: "Baccala", Map_Id: 35, Domain_Id: "Ishtar", Order_Num: 28 },
            ],
        },
        data: {},
        encode: function (e, a) {
            return "string" == typeof e && e.length
                ? ((e = Text.encode_html(e)),
                    $.each(Maps.options.areas, function (t, o) {
                        if (o.Map_Id != a) {
                            var n = o.Text.toLowerCase();
                            e = e.replace(new RegExp(n + "\\b", "g"), "<a href='#' map_id='" + o.Map_Id + "' class='map_area_link' tabIndex='-1');>" + n + "</a>");
                        }
                    }),
                    e)
                : "";
        },
        set_position: function (e) {
            var a = $("#dropdown_maps_area").data("kendoDropDownList");
            if ("object" == typeof e && e.id && e.x && e.y)
                if (e.id != Maps.data.id) {
                    if (
                        ($.each(Maps.options.areas, function (a, t) {
                            if (t.Map_Id == e.id) return (e.filename = t.Filename), (e.domain = t.Domain_Id), (e.text = t.Text), !1;
                        }),
                            !e.filename)
                    )
                        return;
                    $.ajax({ url: "maps/" + e.filename + ".map", dataType: "text", async: !0 })
                        .done(function (t) {
                            Maps.data.id &&
                            a.value() == Maps.data.id &&
                            ($("#main_map_output_wrapper").html(Maps.data.text),
                                $("#main_map_output_wrapper .map_area_link").on("click", function (e) {
                                    var t,
                                        o = $(e.target).attr("map_id");
                                    return (t = a.dataSource.filter()) && (a.dataSource.filter(t.filters[0]), a.filterInput.val("")), a.value(o), Maps.refresh_area_map(), !1;
                                })),
                                (Maps.data = e),
                                (Maps.data.text = Array(Maps.shift).join("\n") + Maps.encode(t, Maps.data.id) + Array(Maps.shift).join("\n")),
                                (Maps.data.y += Maps.shift - 1),
                                Maps.refresh_position();
                        })
                        .fail(function () {
                            Maps.unset_position();
                        });
                } else (Maps.data.x = e.x), (Maps.data.y = e.y + (Maps.shift - 1)), Maps.refresh_position();
        },
        unset_position: function () {
            var e = $("#dropdown_maps_domain").data("kendoDropDownList"),
                a = $("#dropdown_maps_area").data("kendoDropDownList");
            Maps.data.id &&
            a.value() == Maps.data.id &&
            ($("#main_map_output_wrapper").html(Maps.data.text),
                $("#main_map_output_wrapper .map_area_link").on("click", function (e) {
                    var t,
                        o = $(e.target).attr("map_id");
                    return (t = a.dataSource.filter()) && (a.dataSource.filter(t.filters[0]), a.filterInput.val("")), a.value(o), Maps.refresh_area_map(), !1;
                })),
            e.value() && !a.value() && $(".map_domain_link.k-state-active").removeClass("k-state-active"),
                $("#background_map_output").html(""),
                $("#minimap_output > span").css("color", $("#minimap_output").css("color")),
                $("#minimap_output").addClass("k-state-selected"),
                $("#minimap_output").prop("title", "Nie odnajdujesz swojej pozycji na mapie."),
                (Maps.data = {});
        },
        refresh_position: function () {
            var e = $("#dropdown_maps_domain").data("kendoDropDownList"),
                a = $("#dropdown_maps_area").data("kendoDropDownList");
            if (Maps.data.id && Maps.data.text) {
                var t = Maps.data.text.split("\n"),
                    o = Maps.data.x,
                    n = Maps.data.y;
                if (n > t.length || o > t[n - 1].length) Maps.data.active = Maps.data.text;
                else {
                    var i,
                        s = t[n - 1],
                        r = s.length,
                        l = 0,
                        d = 0;
                    for (i = 0; i < r; i++)
                        if (("<" == s[i] && (d = 1), d)) ">" == s[i] && (d = 0);
                        else {
                            if (l == o - 1) {
                                var c = s.substring(i, i + 1);
                                " " == c && (c = "?"), (t[n - 1] = s.substring(0, i) + "<span class='ktb-var-accent'>" + c + "</span>" + s.substring(i + 1));
                                break;
                            }
                            l++;
                        }
                    Maps.data.active = t.join("\n");
                }
                Maps.data.id &&
                a.value() == Maps.data.id &&
                ($("#main_map_output_wrapper").html(Maps.data.active),
                    $("#main_map_output_wrapper .map_area_link").on("click", function (e) {
                        var t,
                            o = $(e.target).attr("map_id");
                        return (t = a.dataSource.filter()) && (a.dataSource.filter(t.filters[0]), a.filterInput.val("")), a.value(o), Maps.refresh_area_map(), !1;
                    })),
                e.value() && !a.value() && ($(".map_domain_link.k-state-active").removeClass("k-state-active"), $("#map_domain_link-" + Maps.data.id).addClass("k-state-active")),
                    $("#minimap_output").html(Maps.data.active),
                    $("#background_map_output").html(Maps.data.active),
                    $("#minimap_output").removeClass("k-state-selected"),
                    $("#minimap_output").prop("title", "Mapa pokazuje twojÄ aktualnÄ pozycjÄ."),
                    Maps.center_minimap(),
                    Maps.center_background_map();
            }
        },
        center_minimap: function () {
            if (Maps.data.id) {
                var e = $("#minimap_output").css("font-size") + " " + $("#minimap_output").css("font-family"),
                    a = Text.get_width("O", e),
                    t = Text.get_height("O", e);
                $("#minimap_output").scrollLeft((Maps.data.x - 0.5) * a - $("#minimap_output").width() / 2), $("#minimap_output").scrollTop((Maps.data.y - 0.5) * t - $("#minimap_output").height() / 2);
            }
        },
        zoom_minimap: function (e) {
            if (Maps.data.id) {
                var a = (current = Number(
                    $("#minimap_output")
                        .css("font-size")
                        .match(/(\d*(\.\d*)?)px/)[1]
                ));
                e < 0 ? a-- : e > 0 && a++, (a = Math.min(Math.max(a, 4), 10)), current != a && ($("#minimap_output").css("font-size", a + "px"), Maps.center_minimap());
            }
        },
        center_background_map: function () {
            if (Maps.data.id) {
                var e = $("#background_map_output").css("font-size") + " " + $("#background_map_output").css("font-family"),
                    a = Text.get_width("O", e),
                    t = Text.get_height("O", e);
                $("#background_map_output").scrollLeft((Maps.data.x - 0.5) * a - $("#background_map_output").width() / 2), $("#background_map_output").scrollTop((Maps.data.y - 0.5) * t - $("#background_map_output").height() / 2);
            }
        },
        refresh_area_map: function () {
            var e = $("#dropdown_maps_domain").data("kendoDropDownList"),
                a = $("#dropdown_maps_area").data("kendoDropDownList"),
                t = Maps.element,
                o = e.value(),
                n = a.value();
            if (o)
                if (n)
                    if (($("#maps_dialog").removeClass("map-domain"), $("#main_map_output").css("max-width", "").css("max-height", ""), Maps.data.id && n == Maps.data.id))
                        $("#main_map_output_wrapper").html(Maps.data.active),
                            $("#main_map_output_wrapper .map_area_link").on("click", function (e) {
                                var t,
                                    o = $(e.target).attr("map_id");
                                return (t = a.dataSource.filter()) && (a.dataSource.filter(t.filters[0]), a.filterInput.val("")), a.value(o), Maps.refresh_area_map(), !1;
                            }),
                            Scroller.refresh(t),
                            Scroller.center_position(t);
                    else {
                        var i = $("#dropdown_maps_area").data("kendoDropDownList").dataItem().Filename;
                        $("#main_map_output_wrapper").html(""),
                        $("#main_map_output .loading_img").length ||
                        ($("#main_map_output").append('<img class="loading_img" src="images/loading.gif" />'),
                            setTimeout(function () {
                                $("#main_map_output .loading_img").show();
                            }, 250)),
                            $.ajax({ url: "maps/" + i + ".map", dataType: "text", async: !0 })
                                .done(function (e) {
                                    a.value() == n &&
                                    ($("html").removeClass("map-domain"),
                                        $("#main_map_output_wrapper").html(Array(Maps.shift).join("\n") + Maps.encode(e, n) + Array(Maps.shift).join("\n")),
                                        $("#main_map_output_wrapper .map_area_link").on("click", function (e) {
                                            var t,
                                                o = $(e.target).attr("map_id");
                                            return (t = a.dataSource.filter()) && (a.dataSource.filter(t.filters[0]), a.filterInput.val("")), a.value(o), Maps.refresh_area_map(), !1;
                                        }),
                                        Scroller.refresh(t),
                                        Scroller.center_position(t));
                                })
                                .always(function () {
                                    $("#main_map_output .loading_img").remove();
                                });
                    }
                else Maps.refresh_domain_map();
        },
        zoom_area_map: function (e, a) {
            var t = Maps.element;
            if ($("#dropdown_maps_area").data("kendoDropDownList").value()) {
                var o = (current = Number(
                    $("#main_map_output")
                        .css("font-size")
                        .match(/(\d*(\.\d*)?)px/)[1]
                ));
                if ((e < 0 ? o-- : e > 0 && o++, (o = Math.min(Math.max(o, 4), 10)), current != o)) {
                    var n = $("#main_map_output").css("font-size") + " " + $("#main_map_output").css("font-family"),
                        i = Text.get_width("O", n),
                        s = Text.get_height("O", n);
                    if ("object" != typeof a)
                        var r = ($("#main_map_output").width() / 2 + Scroller.get_left(t)) / i,
                            l = ($("#main_map_output").height() / 2 + Scroller.get_top(t)) / s;
                    else (r = (a.x + Scroller.get_left(t)) / i), (l = (a.y + Scroller.get_top(t)) / s);
                    $("#main_map_output").css("font-size", o + "px"),
                        Scroller.refresh(t),
                        (n = o + "px " + $("#main_map_output").css("font-family")),
                        (i = Text.get_width("O", n)),
                        (s = Text.get_height("O", n)),
                        "object" != typeof a ? Scroller.set_position(r * i - $("#main_map_output").width() / 2, l * s - $("#main_map_output").height() / 2, t) : Scroller.set_position(r * i - a.x, l * s - a.y, t);
                }
            }
        },
        refresh_domain_map: function () {
            var e = $("#dropdown_maps_domain").data("kendoDropDownList"),
                a = $("#dropdown_maps_area").data("kendoDropDownList"),
                t = Maps.element,
                o = e.value();
            if (o) {
                $("#maps_dialog").addClass("map-domain"),
                    $("#main_map_output_wrapper").html(""),
                $("#main_map_output .loading_img").length ||
                ($("#main_map_output").append('<img class="loading_img" src="images/loading.gif" />'),
                    setTimeout(function () {
                        $("#main_map_output .loading_img").show();
                    }, 250));
                var n = new Image();
                (n.onload = function () {
                    e.value() != o || a.value()
                        ? $(n).remove()
                        : ($("#main_map_output .loading_img").remove(),
                            $("#main_map_output_wrapper").append(n),
                            $("#main_map_output").css("max-width", $("#main_map_output_wrapper > img").width() + "px"),
                            $("#main_map_output").css("max-height", $("#main_map_output_wrapper > img").height() - parseInt($("#main_map_output").css("padding-bottom")) + "px"),
                            $.each(Maps.options.areas, function (e, a) {
                                if (a.Domain_Id == o && "object" == typeof a.Position) {
                                    var t = document.createElement("a");
                                    $(t)
                                        .css({ top: a.Position.y, left: a.Position.x })
                                        .attr("class", "map_domain_link k-button")
                                        .attr("id", "map_domain_link-" + a.Map_Id)
                                        .prop("title", a.Text)
                                        .appendTo($("#main_map_output_wrapper")),
                                    a.Map_Id == Maps.data.id && $(t).addClass("k-state-active");
                                }
                            }),
                            $("#main_map_output_wrapper .map_domain_link").on("click", function (e) {
                                var t,
                                    o = $(e.target).attr("id").substring("map_domain_link-".length);
                                return (t = a.dataSource.filter()) && (a.dataSource.filter(t.filters[0]), a.filterInput.val("")), a.value(o), $("#main_map_output_wrapper").data("kendoTooltip").hide(), Maps.refresh_area_map(), !1;
                            }),
                            Scroller.refresh(t),
                            Scroller.center_position(t));
                }),
                    (n.src = "images/" + o.toLowerCase() + ".jpg");
            }
        },
    },
    Help_mud = {
        element: null,
        options: {
            categories: [
                { Text: "Komendy", Category_Id: "command" },
                { Text: "Emocje", Category_Id: "emotes" },
                { Text: "OgĂłlne", Category_Id: "general" },
                { Text: "Lokacje", Category_Id: "location" },
            ],
            subjects: [],
        },
        index: -1,
        history: [],
        encode: function (e) {
            return "string" == typeof e && e.length
                ? (e = (e = Text.encode_html(e)).replace(/^(.*)$/gm, function (e) {
                    return "    " == e.substring(0, 4)
                        ? "    " == e.substring(4, 8)
                            ? '<span class="style_help_double_margin">' + e.substring(8) + "</span>"
                            : '<span class="style_help_margin">' + e.substring(4) + "</span>"
                        : '<span class="style_help">' + e + "</span>";
                })).replace(new RegExp("\\?(\\w|%)+", "g"), function (e) {
                    return (
                        $.each(Help_mud.options.subjects, function (t, o) {
                            if (o.Subject_Id == e.slice(1)) return (a = o.Category_Id + "/" + o.Subject_Id), !1;
                        }),
                            void 0 === a ? e : "<a href='#' path='" + a + "' class='help_mud_subject_link'>" + e + "</a>"
                    );
                })
                : "";
            var a;
        },
        refresh: function () {
            var e = $("#dropdown_help_mud_category").data("kendoDropDownList"),
                a = $("#dropdown_help_mud_subject").data("kendoDropDownList"),
                t = e.value(),
                o = a.value();
            if (t && o) {
                var n = encodeURI(t + "/" + o);
                $("#help_mud_output_msg_wrapper").html(""),
                $("#help_mud_output .loading_img").length ||
                ($("#help_mud_output").append('<img class="loading_img" src="images/loading.gif" />'),
                    setTimeout(function () {
                        $("#help_mud_output .loading_img").show();
                    }, 250)),
                    $.ajax({ mimeType: "text/plain; charset=x-user-defined", url: "help/" + n, dataType: "text" })
                        .done(function (i) {
                            e.value() == t &&
                            a.value() == o &&
                            ($("#help_mud_output_msg_wrapper").html(Help_mud.encode(i)),
                                Scroller.refresh(Help_mud.element),
                                Scroller.move_up(Help_mud.element),
                                $(".help_mud_subject_link").on("click", function (t) {
                                    var o,
                                        n = $(t.target).attr("path").split("/");
                                    return 2 == n.length && ((o = a.dataSource.filter()) && (a.dataSource.filter(o.filters[0]), a.filterInput.val("")), e.value(n[0]), a.value(n[1]), Help_mud.refresh(), !1);
                                }),
                            (Help_mud.index < 0 || n != Help_mud.history[Help_mud.index]) && (Help_mud.index++, (Help_mud.history = Help_mud.history.slice(0, Help_mud.index)), Help_mud.history.push(n)));
                        })
                        .always(function () {
                            $("#help_mud_output .loading_img").remove();
                        });
            }
        },
        shift: function (e) {
            var a;
            if (e > 0) {
                if (Help_mud.history.length <= Help_mud.index + 1) return;
                a = Help_mud.history[Help_mud.index + 1];
            } else {
                if (!(e < 0)) return;
                if (Help_mud.index <= 0) return;
                a = Help_mud.history[Help_mud.index - 1];
            }
            var t,
                o = a.split("/"),
                n = $("#dropdown_help_mud_category").data("kendoDropDownList"),
                i = $("#dropdown_help_mud_subject").data("kendoDropDownList");
            2 == o.length &&
            ((t = i.dataSource.filter()) && (i.dataSource.filter(t.filters[0]), i.filterInput.val("")),
                n.value(o[0]),
                i.value(o[1]),
                $("#help_mud_output_msg_wrapper").html(""),
            $("#help_mud_output .loading_img").length ||
            ($("#help_mud_output").append('<img class="loading_img" src="images/loading.gif" />'),
                setTimeout(function () {
                    $("#help_mud_output .loading_img").show();
                }, 250)),
                $.ajax({ mimeType: "text/plain; charset=x-user-defined", url: "help/" + a, dataType: "text" })
                    .done(function (a) {
                        n.value() == o[0] &&
                        i.value() == o[1] &&
                        ($("#help_mud_output_msg_wrapper").html(Help_mud.encode(a)),
                            Scroller.refresh(Help_mud.element),
                            Scroller.move_up(Help_mud.element),
                            $(".help_mud_subject_link").on("click", function (e) {
                                var a,
                                    t = $(e.target).attr("path").split("/");
                                return 2 == t.length && ((a = i.dataSource.filter()) && (i.dataSource.filter(a.filters[0]), i.filterInput.val("")), n.value(t[0]), i.value(t[1]), Help_mud.refresh(), !1);
                            }),
                            e > 0 ? Help_mud.index++ : Help_mud.index--);
                    })
                    .always(function () {
                        $("#help_mud_output .loading_img").remove();
                    }));
        },
        load: function () {
            $.each(Help_mud.options.categories, function (e, a) {
                var t = a.Category_Id;
                $.ajax({
                    async: !1,
                    mimeType: "text/plain; charset=x-user-defined",
                    url: "help/" + t,
                    dataType: "text",
                    success: function (e) {
                        var a = $(e)
                            .find("a")
                            .map(function () {
                                return decodeURI($(this).attr("href"));
                            })
                            .get()
                            .slice(5);
                        (Help_mud.options.subjects = Help_mud.options.subjects || []),
                            $.each(a, function (e, a) {
                                if (void 0 !== a && a.length) {
                                    var o = a;
                                    "%%" == a && (o = ".potworz"), Help_mud.options.subjects.push({ Category_Id: t, Subject_Id: o, Text: a });
                                }
                            });
                    },
                });
                var o = new kendo.data.DataSource({ data: jQuery.extend(!0, [], Help_mud.options.subjects) });
                $("#dropdown_help_mud_subject").data("kendoDropDownList").setDataSource(o);
            });
        },
    },
    Help_client = {
        element: null,
        options: {
            categories: [
                { Text: "OgĂłlne", Id: "general" },
                { Text: "Ustawienia", Id: "conf" },
                { Text: "Aliasy", Id: "aliases" },
                { Text: "Makra", Id: "macros" },
                { Text: "Przyciski", Id: "buttons" },
                { Text: "Akcje", Id: "actions" },
                { Text: "PrzeksztaĹcanie tekstu", Id: "patterns" },
            ],
        },
        encode: function (e) {
            return "string" == typeof e && e.length
                ? (e = (e = Text.encode_html(e)).replace(/^(.*)$/gm, function (e) {
                    return "    " == e.substring(0, 4)
                        ? "    " == e.substring(4, 8)
                            ? '<span class="style_help_double_margin">' + e.substring(8) + "</span>"
                            : '<span class="style_help_margin">' + e.substring(4) + "</span>"
                        : '<span class="style_help">' + e + "</span>";
                }))
                : "";
        },
        refresh: function () {
            var e = $("#dropdown_help_client_category").data("kendoDropDownList"),
                a = e.value();
            a &&
            ($("#help_client_output_msg_wrapper").html(""),
            $("#help_client_output .loading_img").length ||
            ($("#help_client_output").append('<img class="loading_img" src="images/loading.gif" />'),
                setTimeout(function () {
                    $("#help_client_output .loading_img").show();
                }, 250)),
                $.ajax({ mimeType: "text/plain; charset=UTF-8", url: "help/client/" + a, dataType: "text" })
                    .done(function (t) {
                        e.value() == a && ($("#help_client_output_msg_wrapper").html(Help_client.encode(t)), Scroller.refresh(Help_client.element), Scroller.move_up(Help_client.element));
                    })
                    .always(function () {
                        $("#help_client_output .loading_img").remove();
                    }));
        },
    },
    Storage = {
        read: function (e, a) {
            return jQuery.parseJSON(localStorage.getItem(e)) || a;
        },
        clear: function (e) {
            return localStorage.removeItem(e);
        },
        send: function (e, a) {
            if (!$("html").hasClass("storage")) return !1;
            for (a = JSON.stringify(a); ; )
                try {
                    localStorage.setItem(e, a);
                } finally {
                    if (a !== localStorage.getItem(e)) {
                        var t = Object.keys(localStorage);
                        if (
                            !(t = (function () {
                                for (var e = [], a = t.length, o = new RegExp("^\\d{4}-\\d{2}-\\d{2}_\\d+$"); a--; ) o.test(t[a]) && e.push(t[a]);
                                return e;
                            })()).length
                        )
                            return !1;
                        t.sort(), localStorage.removeItem(t[0]);
                        continue;
                    }
                    return !0;
                }
        },
    };
(Logs = {
    element: null,
    replay_timeout: null,
    replay_time: null,
    buffer_timeout: null,
    buffer: "",
    date: kendo.toString(new Date(), "yyyy-MM-dd"),
    send: function (e) {
        if ($("html").hasClass("conf") && Logs.buffer.length && Game.data.char.id) {
            if ($("html").hasClass("logging") && $("html").hasClass("storage")) {
                var a = Logs.date + "_" + Game.data.char.id,
                    t = Storage.read(a, []);
                if ((Array.isArray(t) || (t = [t]), Logs.buffer.length < 2e4 && !e && t.length)) return;
                (t[t.length] = LZString.compressToUTF16(Logs.buffer)),
                    !1 === Storage.send(a, t)
                        ? ($("#notification_game").data("kendoNotification").info("Brak miejsca w Local Storage. Logowanie zostaje wyĹÄczone."), $("html").removeClass("logging"))
                        : !t.length && $("#logs_dialog").parent().is(":visible") && Logs.refresh();
            }
            Logs.buffer = "";
        }
    },
    refresh: function () {
        if ($("html").hasClass("storage")) {
            $("#logs_dialog_replay").hide(), $("#logs_dialog_actions").hide(), $("#logs_dialog_selection").show();
            var e = Object.keys(localStorage);
            (e = (function () {
                for (var a = [], t = e.length, o = new RegExp("^\\d{4}-\\d{2}-\\d{2}_" + Game.data.char.id + "$"); t--; ) o.test(e[t]) && a.push(e[t].substring(0, 10));
                return a;
            })()).sort(),
                e.reverse();
            var a = new kendo.data.DataSource({ data: e });
            $("#dropdown_logs_date").data("kendoDropDownList").setDataSource(a);
        }
    },
    set_replay: function (e) {
        if (Logs.replay_time != e) {
            (Logs.replay_time = e),
                $("#slider_replay_logs")
                    .data("kendoSlider")
                    .value(e / 1e3),
                $("#label_replay_logs").html($("#dropdown_logs_date").data("kendoDropDownList").value() + " " + kendo.toString(new Date(e), "HH:mm:ss"));
            var a = Scroller.check_down(Logs.element);
            $("#logs_output_msg_wrapper .output_msg:not(.logs_msg_replay_hidden)").each(function () {
                $(this).data("logs_timestamp") <= Logs.replay_time
                    ? $(this).hasClass("logs_msg_replay_waiting") && ($(this).removeClass("logs_msg_replay_waiting"), a || $("#logs_output").addClass("k-state-selected"))
                    : $(this).hasClass("logs_msg_replay_waiting") || ($(this).addClass("logs_msg_replay_waiting"), a && $("#logs_output").removeClass("k-state-selected"));
            }),
            a && Scroller.move_down(Logs.element),
            Logs.replay_timeout && Logs.play_replay();
        }
    },
    play_replay: function () {
        if ($("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").length) {
            var e = Math.max(1, Math.min(100, $("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").first().data("logs_timestamp") - Logs.replay_time));
            clearTimeout(Logs.replay_timeout),
                (Logs.replay_timeout = setTimeout(function () {
                    Logs.set_replay(Logs.replay_time + e), Logs.play_replay();
                }, e)),
            $("#button_play_replay_logs .fa-pause").length ||
            ($("#button_play_replay_logs").children().remove(),
                $("#button_play_replay_logs").append($('<span class="fa fa-pause"></span>')),
                $("#button_play_replay_logs").prop("title", "WciĹnij, aby zatrzymaÄ odgrywanie loga."),
                $("#button_play_replay_logs").removeClass("k-state-selected"));
        } else Logs.pause_replay();
    },
    pause_replay: function () {
        clearTimeout(Logs.replay_timeout),
            (Logs.replay_timeout = null),
        $("#button_play_replay_logs .fa-play").length ||
        ($("#button_play_replay_logs").children().remove(),
            $("#button_play_replay_logs").append($('<span class="fa fa-play"></span>')),
            $("#button_play_replay_logs").prop("title", "WciĹnij, aby odegraÄ log."),
            $("#button_play_replay_logs").addClass("k-state-selected"));
    },
    backward_replay: function () {
        var e = $("#logs_output_msg_wrapper .output_msg:visible").last().data("logs_timestamp");
        e && (Logs.pause_replay(), Logs.set_replay(e - 1));
    },
    forward_replay: function () {
        var e = $("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").first().data("logs_timestamp");
        e && (Logs.pause_replay(), Logs.set_replay(e));
    },
    stop_replay: function () {
        clearTimeout(Logs.replay_timeout),
            (Logs.replay_timeout = null),
            (Logs.replay_time = null),
            $("#logs_output_msg_wrapper .logs_msg_replay_waiting").removeClass("logs_msg_replay_waiting"),
            $("#logs_output_msg_wrapper .logs_msg_replay_hidden").removeClass("logs_msg_replay_hidden"),
            $("#logs_dialog_replay").hide(),
            $("#logs_dialog_selection").show(),
            $("#button_play_replay_logs").removeClass("k-state-selected"),
            $("#logs_output").removeClass("k-state-selected");
    },
    start_replay: function () {
        if ($("#dropdown_logs_date").data("kendoDropDownList").select()) {
            var e = $("#slider_replay_logs").data("kendoSlider");
            if (e) {
                var a = e.wrapper,
                    t = e.element;
                e.destroy(), a.before(t.show()), a.remove();
            }
            $("#logs_dialog_replay").show(), $("#logs_dialog_selection").hide();
            var o = rangy.getSelection(),
                n = rangy.createRange();
            if ((n.selectNodeContents($("#logs_output_msg_wrapper").get(0)), o.rangeCount)) {
                var i = o.getRangeAt(0).intersection(n);
                if (i && i.startOffset != i.endOffset) {
                    var s = i.startContainer.parentElement,
                        r = i.endContainer.parentElement;
                    (s = $(s).closest(".output_msg")), (r = $(r).closest(".output_msg")), $(s).prevAll().addClass("logs_msg_replay_hidden"), $(r).nextAll().addClass("logs_msg_replay_hidden");
                }
            }
            n.detach(),
                o.collapse(document.body, 0),
                $("#logs_output_msg_wrapper .output_msg:not(.logs_msg_replay_hidden)").addClass("logs_msg_replay_waiting"),
                $("#slider_replay_logs").kendoSlider({
                    showButtons: !1,
                    dragHandleTitle: "PrzesuĹ",
                    tickPlacement: "none",
                    smallStep: 1,
                    largeStep: 60,
                    min: $("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").first().data("logs_timestamp") / 1e3 || 0,
                    max: $("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").last().data("logs_timestamp") / 1e3 || 0,
                    tooltip: { enabled: !1 },
                    change: function (e) {
                        Logs.pause_replay(), Logs.set_replay(1e3 * (e.value + 1) - 1);
                    },
                    slide: function (e) {
                        Logs.pause_replay(), Logs.set_replay(1e3 * (e.value + 1) - 1);
                    },
                }),
                $("#slider_replay_logs").data("kendoSlider").wrapper.css({ width: "100%" }),
                $("#slider_replay_logs").data("kendoSlider").resize(),
            $(".logs_msg_replay_waiting").length && (Logs.set_replay($("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").first().data("logs_timestamp")), Logs.play_replay());
        }
    },
    save_to_file: function () {
        if ($("html").hasClass("storage") && $("html").hasClass("diskaccess")) {
            var e = $("#dropdown_logs_date").data("kendoDropDownList");
            if (e.select()) {
                var a,
                    t = e.dataItem(e.select()),
                    o = rangy.getSelection(),
                    n = rangy.createRange();
                n.selectNodeContents($("#logs_output_msg_wrapper").get(0)),
                o.rangeCount && (a = o.getRangeAt(0).intersection(n)) && ((a = a.toHtml()), (t += "(fragment)")),
                    n.detach(),
                (void 0 !== a && a) || (a = $("#logs_output_msg_wrapper").html()),
                !0 !== Conf.data.logging_times && (a = a.replace(new RegExp('<div class="output_msg_time"><div class="style_system">.*?</div></div>', "g"), "")),
                    (a =
                        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/><style media="screen" type="text/css">body {background: #000; color: #fff; padding: 5px; font-size: ' +
                        Conf.data.font_size +
                        "px; font-family: " +
                        Conf.data.font_type +
                        ", Monospace; word-wrap: break-word; white-space: pre-wrap;} .style_system {color: #999; margin-top: 10px; margin-bottom: 5px;} .style_command {color: #999;} .style_blocked_command {color: #999; opacity: 0.5;} .output_msg_snoop {font-style: italic; margin-left: 10px;} .output_msg_command {margin-top: 10px;} </style><body>" +
                        a +
                        "</body>"),
                    kendo.saveAs({ dataURI: "data:text/plain;base64," + kendo.util.encodeBase64(a), fileName: Text.capitalize(Game.data.char.name) + "_log_" + t + ".html" });
            }
        }
    },
}),
    $(document).ready(function () {
        if (
            ((window.onerror = function (e, a, t) {
                if (Client.options.debug && $("html").hasClass("k-mobile")) return alert("Error message: " + e + "\nURL: " + a + "\nLine Number: " + t), !0;
            }),
                (Client.params = unescape(location.search.substr(1).replace(/[+]/g, " "))),
                history.replaceState(null, document.getElementsByTagName("title")[0].innerHTML, window.location.pathname),
                kendo.culture("pl-PL"),
                $("html").addClass("login"),
            "WebSocket" in window && $("html").addClass("websocket"),
            ("ontouchstart" in window || navigator.msMaxTouchPoints) && $("html").addClass("touch"),
            "localStorage" in window && ($("html").addClass("storage"), localStorage.getItem("jStorage")))
        ) {
            var e = jQuery.parseJSON(localStorage.getItem("jStorage"));
            localStorage.clear(),
                $.each(Object.keys(e), function (a, t) {
                    "__jstorage_meta" != t && localStorage.setItem(t, JSON.stringify(e[t]));
                });
        }
        var a, t;
        $("html").hasClass("k-mobile") &&
        (navigator.userAgent.match(/BlackBerry/i)
            ? $("html").addClass("mobile-BlackBerry")
            : navigator.userAgent.match(/Opera Mini/i)
                ? $("html").addClass("mobile-Opera")
                : navigator.userAgent.match(/IEMobile/i)
                    ? $("html").addClass("mobile-IE")
                    : navigator.userAgent.match(/Android/i)
                        ? $("html").addClass("mobile-Android")
                        : navigator.userAgent.match(/iPhone|iPad|iPod/i) && $("html").addClass("mobile-iOS"),
        (window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches || ("standalone" in window.navigator && window.navigator.standalone)) &&
        $("html").addClass("mobile-standalone"),
            window.matchMedia("(max-height : 600px), (max-width : 600px)").matches
                ? $("html").addClass("mobile-small")
                : window.matchMedia("(max-height : 800px), (max-width : 800px)").matches
                    ? $("html").addClass("mobile-medium")
                    : $("html").addClass("mobile-large")),
        $("html").hasClass("mobile-iOS") || kendo.support.browser.safari || $("html").addClass("diskaccess"),
            Client.set_theme(),
            $.ajax({ url: "client.appcache", dataType: "text", async: !1, cache: !0 }).done(function (e) {
                (Client.version = parseFloat(e.split("\n")[1].replace(/[^0-9\.]+/g, ""))), $(".cached_version").text(Client.version.toString());
            }),
            $.ajax({ url: "client.appcache", dataType: "text", async: !1, cache: !1 }).done(function (e) {
                var a = parseFloat(e.split("\n")[1].replace(/[^0-9\.]+/g, ""));
                $(".current_version").text(a.toString()), Client.version != a && $("html").addClass("version_update");
            }),
            $(".panelbar").kendoPanelBar({
                expandMode: "single",
                animation: { expand: { effects: "expand:vertical" }, collapse: { effects: "expand:vertical", reverse: !0 } },
                select: function (e) {
                    if ($(e.item).is(".k-state-active")) {
                        var a = this;
                        window.setTimeout(function () {
                            a.collapse(e.item), $(e.item).children("span").removeClass("k-state-selected").removeClass("k-state-focused").removeClass("k-state-hover");
                        }, 1);
                    }
                },
            }),
            $(".datetime_picker").kendoDateTimePicker({ min: new Date() }),
            $(".dropdown").kendoDropDownList(),
            $(".button").kendoButton(),
            $(".listview").kendoListView(),
            $(".notification").each(function () {
                $(this).kendoNotification({
                    show: function (e) {
                        null != a && a.remove(), (a = e.element);
                    },
                    appendTo: $(this),
                    animation: { open: { effects: "expand:vertical" }, close: { effects: "expand:vertical", reverse: !0 } },
                });
            }),
            $(".notification_interface").kendoNotification({
                show: function (e) {
                    null != t && t.parent().remove(),
                        (t = e.element),
                        e.element.parent().css({ top: "50%", left: 0, right: 0, zIndex: 22222, marginLeft: "auto", marginRight: "auto", width: "100%", maxWidth: 400 }),
                        e.element.css({ left: 0, right: 0, textAlign: "center" });
                },
                autoHideAfter: 0,
                animation: { open: { effects: "expand:vertical" }, close: { effects: "expand:vertical", reverse: !0 } },
            }),
            $(".dialog_window").kendoWindow({ visible: !1, draggable: !0, resizable: !0, width: 620, minWidth: 300, minHeight: 300, actions: $("html").hasClass("mobile-small") ? ["Close"] : ["Minimize", "Close"] }),
            $(".panel_progressbar").each(function () {
                $(this).kendoProgressBar({ showStatus: !1, value: 1 }),
                    $(this).data("kendoProgressBar").value(0),
                    $(this).kendoTouch({
                        doubleTapTimeout: 0,
                        tap: function (e) {
                            switch ((e.event.preventDefault(), $(this.element).attr("id"))) {
                                case "health_bar":
                                    Input.send("kondycja");
                                    break;
                                case "mana_bar":
                                    Input.send("mana");
                                    break;
                                case "fatigue_bar":
                                    Input.send("zmeczenie");
                                    break;
                                case "encumbrance_bar":
                                    Input.send("obciazenie");
                                    break;
                                case "panic_bar":
                                    Input.send("panika");
                                    break;
                                case "stuffed_bar":
                                    Input.send("glod");
                                    break;
                                case "soaked_bar":
                                    Input.send("pragnienie");
                                    break;
                                case "intox_bar":
                                case "headache_bar":
                                    Input.send("stan");
                                    break;
                                case "exp_bar":
                                    Input.send("postepy");
                                    break;
                                case "form_bar":
                                    Input.send("forma");
                            }
                        },
                    });
            }),
            $("#directions .button").kendoTouch({
                doubleTapTimeout: 0,
                tap: function (e) {
                    e.event.preventDefault(), Input.send($(this.element).attr("id").replace(/_/g, " ")), $(this.element).hasClass("directions") && $(this.element).removeClass("k-state-active").removeClass("k-state-focused");
                },
            }),
            $("#topmenu").kendoToolBar({
                items: [
                    {
                        type: "button",
                        id: "topmenu_connect",
                        text: "PoĹÄcz",
                        click: function (e) {
                            Client.toggle_connection();
                        },
                    },
                    {
                        type: "button",
                        id: "topmenu_forum",
                        text: "Forum",
                        hidden: $("html").hasClass("mobile-iOS") && $("html").hasClass("mobile-standalone"),
                        click: function (e) {
                            window.open("https://arkadia.rpg.pl/forum/");
                        },
                    },
                    {
                        type: "button",
                        id: "topmenu_wiki",
                        text: "Wiki",
                        hidden: $("html").hasClass("mobile-iOS") && $("html").hasClass("mobile-standalone"),
                        click: function (e) {
                            window.open("https://wikipedia.arkadia.rpg.pl/");
                        },
                    },
                    {
                        type: "splitButton",
                        id: "topmenu_maps",
                        text: "Mapy",
                        attributes: { style: "display: none;" },
                        menuButtons: [
                            {
                                text: "Mapa Imperium",
                                id: "topmenu_imperium_map",
                                click: function (e) {
                                    var a,
                                        t = $("#dropdown_maps_domain").data("kendoDropDownList"),
                                        o = $("#dropdown_maps_area").data("kendoDropDownList");
                                    (a = o.dataSource.filter()) && (o.dataSource.filter(a.filters[0]), o.filterInput.val("")),
                                        t.value("Imperium"),
                                        o.value([]),
                                        $("#maps_dialog").parent().is(":visible") ? $("#maps_dialog").data("kendoWindow").toFront() : ($("#maps_dialog").data("kendoWindow").center().open(), Maps.refresh_area_map());
                                },
                            },
                            {
                                text: "Mapa Ishtar",
                                id: "topmenu_ishtar_map",
                                click: function (e) {
                                    var a,
                                        t = $("#dropdown_maps_domain").data("kendoDropDownList"),
                                        o = $("#dropdown_maps_area").data("kendoDropDownList");
                                    (a = o.dataSource.filter()) && (o.dataSource.filter(a.filters[0]), o.filterInput.val("")),
                                        t.value("Ishtar"),
                                        o.value([]),
                                        $("#maps_dialog").parent().is(":visible") ? $("#maps_dialog").data("kendoWindow").toFront() : ($("#maps_dialog").data("kendoWindow").center().open(), Maps.refresh_area_map());
                                },
                            },
                        ],
                    },
                    {
                        type: "button",
                        id: "topmenu_generate_name",
                        text: "Generator imion",
                        overflow: "always",
                        hidden: !0,
                        click: function (e) {
                            window.open("https://arkadia.rpg.pl/generator-imion/");
                        },
                    },
                    {
                        type: "button",
                        id: "topmenu_tutorial",
                        text: "Samouczek",
                        overflow: "always",
                        hidden: !0,
                        click: function (e) {
                            $("#tutorial_dialog").parent().is(":visible") ? $("#tutorial_dialog").data("kendoWindow").toFront() : $("#tutorial_dialog").data("kendoWindow").center().open();
                        },
                    },
                    {
                        type: "button",
                        id: "topmenu_help_mud",
                        text: "Pomoc do gry",
                        overflow: "always",
                        click: function (e) {
                            if ($("#help_mud_dialog").parent().is(":visible")) $("#help_mud_dialog").data("kendoWindow").toFront();
                            else {
                                $("#help_mud_dialog").data("kendoWindow").center().open();
                                var a,
                                    t = $("#dropdown_help_mud_category").data("kendoDropDownList"),
                                    o = $("#dropdown_help_mud_subject").data("kendoDropDownList");
                                (a = o.dataSource.filter()) && (o.dataSource.filter(a.filters[0]), o.filterInput.val("")), t.value("general"), o.value("tematy"), Help_mud.refresh();
                            }
                        },
                    },
                    {
                        type: "button",
                        id: "topmenu_help_client",
                        text: "Pomoc do klienta",
                        overflow: "always",
                        click: function (e) {
                            $("#help_client_dialog").parent().is(":visible")
                                ? $("#help_client_dialog").data("kendoWindow").toFront()
                                : ($("#help_client_dialog").data("kendoWindow").center().open(), $("#dropdown_help_client_category").data("kendoDropDownList").value("general"), Help_client.refresh());
                        },
                    },
                    {
                        type: "button",
                        id: "topmenu_mud",
                        text: "O Arkadii",
                        overflow: "always",
                        click: function (e) {
                            $("#mud_dialog").parent().is(":visible") ? $("#mud_dialog").data("kendoWindow").toFront() : $("#mud_dialog").data("kendoWindow").center().open();
                        },
                    },
                    {
                        type: "button",
                        id: "topmenu_client",
                        text: "O kliencie",
                        overflow: "always",
                        click: function (e) {
                            $("#client_dialog").parent().is(":visible") ? $("#client_dialog").data("kendoWindow").toFront() : $("#client_dialog").data("kendoWindow").center().open();
                        },
                    },
                    {
                        type: "splitButton",
                        id: "topmenu_conf",
                        overflow: "never",
                        attributes: { style: "display: none;" },
                        menuButtons: [
                            {
                                text: "Ustawienia klienta",
                                id: "topmenu_conf_client",
                                click: function (e) {
                                    $("#conf_dialog").parent().is(":visible")
                                        ? $("#conf_dialog").data("kendoWindow").toFront()
                                        : ($("#conf_dialog").data("kendoWindow").center().open(),
                                            Conf.refresh_conf(),
                                            $("#conf_dialog_body").removeClass("listview_scrolled_down"),
                                            $("#conf_dialog_body").scrollTop(0),
                                            $("#conf_dialog .change_button").removeClass("k-state-selected"));
                                },
                            },
                            {
                                text: "Aliasy",
                                id: "topmenu_conf_aliases",
                                click: function (e) {
                                    $("#aliases_dialog").parent().is(":visible")
                                        ? $("#aliases_dialog").data("kendoWindow").toFront()
                                        : ($("#aliases_dialog").data("kendoWindow").center().open(),
                                            Conf.refresh_aliases(),
                                            $("#listview_aliases_list").removeClass("listview_scrolled_down"),
                                            $("#listview_aliases_list").scrollTop(0),
                                            $("#input_alias_command").val(""),
                                            $("#textarea_alias_replacement").val(""),
                                            $("#aliases_dialog .change_button").removeClass("k-state-selected"));
                                },
                            },
                            {
                                text: "Makra",
                                id: "topmenu_conf_macros",
                                click: function (e) {
                                    $("#macros_dialog").parent().is(":visible")
                                        ? $("#macros_dialog").data("kendoWindow").toFront()
                                        : ($("#macros_dialog").data("kendoWindow").center().open(),
                                            Conf.refresh_macros(),
                                            $("#listview_macros_list").removeClass("listview_scrolled_down"),
                                            $("#listview_macros_list").scrollTop(0),
                                            $("#dropdown_macro_key").data("kendoDropDownList").select(""),
                                            $("#textarea_macro_replacement").val(""),
                                            $("#macros_dialog .change_button").removeClass("k-state-selected"));
                                },
                            },
                            {
                                text: "Przyciski",
                                id: "topmenu_conf_buttons",
                                click: function (e) {
                                    $("#buttons_dialog").parent().is(":visible")
                                        ? $("#buttons_dialog").data("kendoWindow").toFront()
                                        : ($("#buttons_dialog").data("kendoWindow").center().open(),
                                            Conf.refresh_buttons(),
                                            $("#listview_buttons_list").removeClass("listview_scrolled_down"),
                                            $("#listview_buttons_list").scrollTop(0),
                                            $("#input_button_command").val(""),
                                            $("#dropdown_button_panel").data("kendoDropDownList").select(""),
                                            $("#textarea_button_replacement").val(""),
                                            $("#buttons_dialog .change_button").removeClass("k-state-selected"));
                                },
                            },
                            {
                                text: "Akcje",
                                id: "topmenu_conf_actions",
                                click: function (e) {
                                    $("#actions_dialog").parent().is(":visible")
                                        ? $("#actions_dialog").data("kendoWindow").toFront()
                                        : ($("#actions_dialog").data("kendoWindow").center().open(),
                                            Conf.refresh_actions(),
                                            $("#listview_actions_list").removeClass("listview_scrolled_down"),
                                            $("#listview_actions_list").scrollTop(0),
                                            $("#input_action_command").val(""),
                                            $("#multiselect_action_char_type").data("kendoMultiSelect").value([]),
                                            $("#dropdown_action_team_role").data("kendoDropDownList").select(""),
                                            $("#textarea_action_replacement").val(""),
                                            $("#actions_dialog .change_button").removeClass("k-state-selected"));
                                },
                            },
                            {
                                text: "PrzeksztaĹcanie tekstu",
                                id: "topmenu_conf_patterns",
                                click: function (e) {
                                    $("#patterns_dialog").parent().is(":visible")
                                        ? $("#patterns_dialog").data("kendoWindow").toFront()
                                        : ($("#patterns_dialog").data("kendoWindow").center().open(),
                                            Conf.refresh_patterns(),
                                            $("#listview_patterns_list").removeClass("listview_scrolled_down"),
                                            $("#listview_patterns_list").scrollTop(0),
                                            $("#input_pattern_regexp").val(""),
                                            $("#dropdown_pattern_replacement_flag").data("kendoDropDownList").value(2),
                                            $("#input_pattern_replacement").val(""),
                                            $("#dropdown_pattern_color_flag").data("kendoDropDownList").value(2),
                                            $("#colorpicker_pattern_color").data("kendoColorPicker").value("#ffffff"),
                                            $("#dropdown_pattern_sound_flag").data("kendoDropDownList").value(2),
                                            $("#dropdown_pattern_sound").data("kendoDropDownList").value(1),
                                            $("#input_pattern_replacement").prop("disabled", !0),
                                            $("#colorpicker_pattern_color").data("kendoColorPicker").enable(!1),
                                            $("#dropdown_pattern_sound").data("kendoDropDownList").enable(!1),
                                            $("#patterns_dialog .change_button").removeClass("k-state-selected"));
                                },
                            },
                            {
                                text: "Eksport/import konfiguracji",
                                id: "topmenu_conf_export_import",
                                click: function (e) {
                                    $("#export_import_dialog").parent().is(":visible")
                                        ? $("#export_import_dialog").data("kendoWindow").toFront()
                                        : ($("#export_import_dialog").data("kendoWindow").center().open(),
                                            Conf.refresh_export_import(),
                                            $("#listview_import_conf").removeClass("listview_scrolled_down"),
                                            $("#listview_import_conf").scrollTop(0),
                                            $("#input_export_conf").val(""),
                                            $("#listview_import_conf .k-state-selected").removeClass("k-state-selected"));
                                },
                            },
                        ],
                    },
                ],
            }),
            $("#bottommenu").kendoToolBar({
                overflowOpen: function (e) {
                    $("#bottommenu").data("kendoToolBar").popup.element.parent().css("padding-bottom", "");
                },
                items: [
                    { id: "bottommenu_input", template: "<textarea id='user_input' type='text' value='' rows='1' autocomplete='off' autocorrect='off' autocapitalize='none' spellcheck='false'/>", overflow: "never" },
                    { type: "button", id: "bottommenu_mail", spriteCssClass: "fa fa-envelope-o", showText: "overflow", text: "Poczta", hidden: !0 },
                    {
                        type: "button",
                        id: "bottommenu_keyboard",
                        togglable: !0,
                        showText: "overflow",
                        text: "Panel dotykowy",
                        spriteCssClass: "fa fa-keyboard-o",
                        hidden: !$("html").hasClass("touch"),
                        toggle: function (e) {
                            e.checked
                                ? ($("html").addClass("panel_touch"), Conf.data.touch_panels.indexOf("keyboard") > -1 && ($("#user_input").blur(), $("#user_input").attr("readonly", !0)))
                                : ($("html").removeClass("panel_touch"), Conf.data.touch_panels.indexOf("keyboard") > -1 && ($("#user_input").blur(), $("#user_input").attr("readonly", !1))),
                                Touch.refresh(),
                                Client.resize();
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_messages",
                        togglable: !0,
                        showText: "overflow",
                        text: "Okno pomocnicze",
                        spriteCssClass: "fa fa-clone",
                        hidden: $("html").hasClass("mobile-small"),
                        toggle: function (e) {
                            e.checked ? ($("#messages_dialog").data("kendoWindow").center().open(), Messages.refresh()) : $("#messages_dialog").data("kendoWindow").close();
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_logs",
                        togglable: !0,
                        showText: "overflow",
                        text: "Logi",
                        spriteCssClass: "fa fa-history",
                        toggle: function (e) {
                            e.checked ? ($("#logs_dialog").data("kendoWindow").center().open(), Logs.refresh()) : $("#logs_dialog").data("kendoWindow").close();
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_full_screen",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "PeĹen ekran",
                        spriteCssClass: "fa fa-expand",
                        hidden: $("html").hasClass("mobile-standalone") || (!document.fullscreenEnabled && !document.webkitFullscreenEnabled && !document.mozFullScreenEnabled && !document.msFullscreenEnabled),
                        toggle: function (e) {
                            e.checked
                                ? document.documentElement.requestFullscreen
                                    ? document.documentElement.requestFullscreen()
                                    : document.documentElement.msRequestFullscreen
                                        ? document.documentElement.msRequestFullscreen()
                                        : document.documentElement.mozRequestFullScreen
                                            ? document.documentElement.mozRequestFullScreen()
                                            : document.documentElement.webkitRequestFullscreen && document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
                                : document.exitFullscreen
                                    ? document.exitFullscreen()
                                    : document.msExitFullscreen
                                        ? document.msExitFullscreen()
                                        : document.mozCancelFullScreen
                                            ? document.mozCancelFullScreen()
                                            : document.webkitExitFullscreen && document.webkitExitFullscreen();
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_panel_right",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "Prawy panel",
                        spriteCssClass: "fa fa-caret-square-o-right",
                        hidden: $("html").hasClass("mobile-small"),
                        toggle: function (e) {
                            e.checked ? $("html").addClass("panel_right") : $("html").removeClass("panel_right"), Conf.refresh();
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_panel_left",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "Lewy panel",
                        spriteCssClass: "fa fa-caret-square-o-left",
                        hidden: $("html").hasClass("mobile-small"),
                        toggle: function (e) {
                            e.checked ? $("html").addClass("panel_left") : $("html").removeClass("panel_left"), Conf.refresh();
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_aliases",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "Aliasy",
                        spriteCssClass: "fa fa-font",
                        toggle: function (e) {
                            e.checked ? $("html").addClass("aliases") : $("html").removeClass("aliases");
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_macros",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "Makra",
                        spriteCssClass: "fa fa-external-link",
                        toggle: function (e) {
                            e.checked ? $("html").addClass("macros") : $("html").removeClass("macros");
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_sounds",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "DĹşwiÄki",
                        spriteCssClass: "fa fa-volume-up",
                        toggle: function (e) {
                            e.checked ? $("html").addClass("sounds") : $("html").removeClass("sounds");
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_text_replacements",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "Zmiany tekstu",
                        spriteCssClass: "fa fa-random",
                        toggle: function (e) {
                            e.checked ? $("html").addClass("text_replacements") : $("html").removeClass("text_replacements");
                        },
                    },
                    {
                        type: "button",
                        id: "bottommenu_colors",
                        togglable: !0,
                        overflow: "always",
                        showText: "overflow",
                        text: "Kolory",
                        spriteCssClass: "fa fa-paint-brush",
                        toggle: function (e) {
                            e.checked ? $("html").addClass("colors") : $("html").removeClass("colors");
                        },
                    },
                ],
            }),
            $("#topmenu_conf_wrapper span").attr("class", "k-sprite fa fa-cog"),
            $("#topmenu_maps_wrapper span").attr("class", "").html("Mapy"),
            $("#bottommenu .k-overflow-anchor > span").attr("class", "k-sprite fa fa-check-square-o"),
            $("#topmenu").data("kendoToolBar").hide("#topmenu_conf"),
            $("#topmenu").data("kendoToolBar").resize(),
            ($("#bottommenu").data("kendoToolBar").popup.options.origin = "top right"),
            ($("#bottommenu").data("kendoToolBar").popup.options.position = "bottom right"),
            ($("#bottommenu").data("kendoToolBar").popup.options.animation.open.effects = "slideIn:up"),
            ($($("#bottommenu").data("kendoToolBar").popup.element).data("kendoPopup").collisions[0] = "fit"),
            $("html").addClass("aliases").addClass("macros").addClass("sounds").addClass("text_replacements").addClass("colors"),
            $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_aliases_overflow", !0),
            $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_macros_overflow", !0),
            $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_sounds_overflow", !0),
            $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_text_replacements_overflow", !0),
            $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_colors_overflow", !0),
        $("html").hasClass("mobile-small") ||
        $("html").hasClass("mobile-medium") ||
        ($("html").addClass("panel_right").addClass("panel_left"),
            $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_panel_right_overflow", !0),
            $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_panel_left_overflow", !0)),
            $("#bottommenu_mail").prop("title", "Poczta"),
            $("#bottommenu_keyboard").prop("title", "Panel dotykowy"),
            $("#bottommenu_messages").prop("title", "Okno pomocnicze"),
            $("#bottommenu_logs").prop("title", "Logi"),
            $("#bottommenu_full_screen").prop("title", "PeĹen ekran"),
            (Output.element = document.getElementById("main_text_output")),
            (Messages.element = document.getElementById("messages_output"));
        var o = (Input.element = document.getElementById("user_input")),
            n = (Touch.element = document.getElementById("panel_touch")),
            i =
                ((Logs.element = document.getElementById("logs_output")),
                    (Help_mud.element = document.getElementById("help_mud_output")),
                    (Help_client.element = document.getElementById("help_client_output")),
                    (Maps.element = document.getElementById("main_map_output")));
        if (
            ($("#listview_chars_list").kendoListView({
                dataTextField: "name",
                dataValueField: "name",
                selectable: !0,
                template: '#if (data.blocked) {# <span class="line_through capitalize">${data.name}</span> # } else { # <span class="capitalize">${data.name}</span> #}#',
                change: function (e) {
                    var a = $("#listview_chars_list").data("kendoListView").select();
                    a.text() &&
                    (a.hasClass("line_through")
                        ? ($("#button_toggle_block_char").prop("title", "WciĹnij, aby odblokowaÄ postaÄ."), $("#button_toggle_block_char").prop("value", "Odblokuj"))
                        : ($("#button_toggle_block_char").prop("title", "WciĹnij, aby zablokowaÄ postaÄ."), $("#button_toggle_block_char").prop("value", "Zablokuj")));
                },
            }),
                $("#input_char_name").on("input", function (e) {
                    Account.check_name();
                }),
                $("#notification_name").data("kendoNotification").setOptions({ autoHideAfter: 0 }),
                $("#dropdown_set_race").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "val",
                    dataSource: [],
                    template: '<div class="capitalize">#= Text.encode_UTF16(data.text) #</div>',
                    valueTemplate: '<div class="capitalize">#= Text.encode_UTF16(data.text) #</div>',
                    change: function (e) {
                        Account.set_adjectives_datasources();
                    },
                }),
                $("#dropdown_set_gender").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "val",
                    dataSource: [],
                    template: '<div class="capitalize">#= Text.encode_UTF16(data.text) #</div>',
                    valueTemplate: '<div class="capitalize">#= Text.encode_UTF16(data.text) #</div>',
                    change: function (e) {
                        Account.set_adjectives_datasources();
                    },
                }),
                $("#dropdown_set_first_adjective").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "val",
                    dataSource: [],
                    filter: "contains",
                    groupTemplate: "<div>#= Text.encode_UTF16(data) #</div>",
                    fixedGroupTemplate: "<div>#= Text.encode_UTF16(data) #</div>",
                    change: function (e) {
                        Account.set_adjectives_datasources();
                    },
                }),
                $("#dropdown_set_second_adjective").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "val",
                    dataSource: [],
                    filter: "contains",
                    groupTemplate: "<div>#= Text.encode_UTF16(data) #</div>",
                    fixedGroupTemplate: "<div>#= Text.encode_UTF16(data) #</div>",
                    change: function (e) {
                        Account.set_adjectives_datasources();
                    },
                }),
                $("#dropdown_set_startloc").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "val",
                    dataSource: [],
                    template: '<div class="capitalize">#= Text.encode_UTF16(data.text) #</div>',
                    valueTemplate: '<div class="capitalize">#= Text.encode_UTF16(data.text) #</div>',
                }),
                $("#multiselect_messages_types").kendoMultiSelect({
                    placeholder: "Wybierz typ...",
                    dataSource: [],
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        Messages.refresh();
                    },
                }),
                $("#messages_dialog")
                    .data("kendoWindow")
                    .title("Okno pomocnicze")
                    .setOptions({
                        height: 600,
                        close: function (e) {
                            $("#bottommenu_messages").hasClass("k-state-active")
                                ? $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_messages", !1)
                                : $("#bottommenu_messages_overflow > a").hasClass("k-state-active") && $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_messages_overflow", !1),
                                Messages.clear();
                        },
                        resize: function (e) {
                            Scroller.check_down(Messages.element) && $("#messages_output").removeClass("k-state-selected");
                        },
                    }),
                $("#dropdown_conf_theme").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.theme_type),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_font_type").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.font_type),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_font_size").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.font_size),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_logging").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.logging),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_logging_times").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.logging_times),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_output_times").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.output_times),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_output_limit").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.output_limit),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_output_command_echo").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.output_command_echo),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_background_map").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.background_map),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_history_limit").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.history_limit),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_input_echo").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.input_echo),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_input_split").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.input_split),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_input_variables").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.input_variables),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_blocking_variables").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.blocking_variables),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_panel_chars_order").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.panel_chars_order),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_actions_popup_position").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.actions_popup_position),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#dropdown_conf_side_buttons_position").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.side_buttons_position),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#multiselect_conf_touch_panels").kendoMultiSelect({
                    placeholder: "Wybierz panele...",
                    dataSource: jQuery.extend(!0, [], Conf.options.touch_panels),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                kendo.ui.plugin(
                    kendo.ui.MultiSelect.extend({
                        _keydown: function (e) {
                            var a = this.input.val(),
                                t = !1,
                                o = this;
                            $.each(this.dataSource.data(), function (e, n) {
                                n && (a && n.Id == a ? (t = !0) : -1 == o.value().indexOf(n.Id) && (o.dataSource.remove(o.dataSource.at(e)), o._render(o.dataSource.view())));
                            }),
                                e.keyCode != kendo.keys.ENTER
                                    ? kendo.ui.MultiSelect.fn._keydown.call(this, e)
                                    : a && !t && (this.dataSource.add({ Text: a, Id: a }), this._render(this.dataSource.view()), this._select(this.dataSource.view().length - 1), $("#conf_dialog .change_button").addClass("k-state-selected"));
                        },
                        options: { name: "TagList" },
                    })
                ),
                $("#multiselect_conf_extra_history").kendoTagList({
                    placeholder: "Dodaj komendy...",
                    dataSource: [],
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#multiselect_conf_panel_top").kendoMultiSelect({
                    placeholder: "Wybierz obiekty...",
                    dataSource: jQuery.extend(!0, [], Conf.options.panel_objects),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        Conf.refresh_panel_multiselects(), $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#multiselect_conf_panel_right").kendoMultiSelect({
                    placeholder: "Wybierz obiekty...",
                    dataSource: jQuery.extend(!0, [], Conf.options.panel_objects),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        Conf.refresh_panel_multiselects(), $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#multiselect_conf_panel_bottom").kendoMultiSelect({
                    placeholder: "Wybierz obiekty...",
                    dataSource: jQuery.extend(!0, [], Conf.options.panel_objects),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        Conf.refresh_panel_multiselects(), $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#multiselect_conf_panel_left").kendoMultiSelect({
                    placeholder: "Wybierz obiekty...",
                    dataSource: jQuery.extend(!0, [], Conf.options.panel_objects),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        Conf.refresh_panel_multiselects(), $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#conf_dialog_body .colorpicker").kendoColorPicker({
                    buttons: !1,
                    change: function (e) {
                        $("#conf_dialog .change_button").addClass("k-state-selected");
                    },
                }),
                $("#listview_aliases_list").kendoListView({
                    dataTextField: "Command",
                    dataValueField: "Command",
                    dataSource: [],
                    template:
                        '<div class="listview_elem k-widget"><span class="listview_elem_right"><span class="listview_elem_delete fa fa-trash-o"></span></span><span class="listview_elem_left"><span class="listview_elem_large">#= Text.encode_html(data.Command) #</span><span class="fa fa-long-arrow-right"></span><span>#= Text.style_multi_command(Text.encode_html(data.Replacement)) #</span></span></div>',
                }),
                $("#listview_aliases_list").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        e.event.preventDefault();
                        var a = $(e.event.target);
                        if (a.hasClass("listview_elem_delete")) {
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            $("#listview_aliases_list").data("kendoListView").remove(a.closest(".listview_elem")), $("#aliases_dialog .change_button").addClass("k-state-selected");
                        } else if (a.closest(".listview_elem").length) {
                            var t = $("#listview_aliases_list").data("kendoListView").dataItem(a.closest(".listview_elem"));
                            $("#input_alias_command").val(t.Command), $("#textarea_alias_replacement").val(t.Replacement);
                        }
                    },
                }),
                $("#dropdown_macro_key").kendoDropDownList({ optionLabel: "Klawisz makra...", dataSource: [], dataTextField: "Key", dataValueField: "Key" }),
                $("#listview_macros_list").kendoListView({
                    dataTextField: "Key",
                    dataValueField: "Key",
                    dataSource: [],
                    template:
                        '<div class="listview_elem k-widget"><span class="listview_elem_right"><span class="listview_elem_delete fa fa-trash-o"></span></span><span class="listview_elem_left"><span class="listview_elem_large">#= Text.encode_html(data.Key) #</span><span class="fa fa-long-arrow-right"></span><span>#= Text.style_multi_command(Text.encode_html(data.Replacement)) #</span></span></div>',
                }),
                $("#listview_macros_list").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        e.event.preventDefault();
                        var a = $(e.event.target);
                        if (a.hasClass("listview_elem_delete")) {
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            $("#listview_macros_list").data("kendoListView").remove(a.closest(".listview_elem")), $("#macros_dialog .change_button").addClass("k-state-selected");
                        } else if (a.closest(".listview_elem").length) {
                            var t = $("#listview_macros_list").data("kendoListView").dataItem(a.closest(".listview_elem"));
                            $("#dropdown_macro_key").data("kendoDropDownList").value(t.Key), $("#textarea_macro_replacement").val(t.Replacement);
                        }
                    },
                }),
                $("#dropdown_button_panel").kendoDropDownList({
                    optionLabel: "Panel...",
                    dataSource: jQuery.extend(!0, [], Conf.options.panels),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    template: '<div class="dropdown_elem"><span class="icon fa #= data.Css_Icon #"></span><span>#= data.Text #</span><div>',
                }),
                $("#dropdown_button_panel").closest(".k-dropdown").width(100),
                $("#listview_buttons_list").kendoListView({
                    dataTextField: "Name",
                    dataValueField: "Name",
                    dataSource: [],
                    template:
                        '<div class="listview_elem k-widget"><span class="listview_elem_right"><span class="listview_elem_delete fa fa-trash-o"></span></span><span class="listview_elem_left"><span class="listview_elem_handler fa fa-sort"></span>#= Conf.generate_buttons_template(data) #<span class="listview_elem_large uppercase">#= Text.encode_html(decodeURI(data.Name)) #</span><span class="fa fa-long-arrow-right"></span><span>#= Text.style_multi_command(Text.encode_html(data.Replacement)) #</span></span></div>',
                }),
                $("#listview_buttons_list").kendoSortable({
                    filter: ".listview_elem",
                    handler: ".listview_elem_handler",
                    placeholder: function (e) {
                        return e.clone().css("opacity", 0.5);
                    },
                    hint: function (e) {
                        return e.clone().css("color", e.css("color"));
                    },
                    change: function (e) {
                        var a = $("#listview_buttons_list").data("kendoListView").dataSource,
                            t = e.oldIndex,
                            o = e.newIndex,
                            n = (a.data(), a.getByUid(e.item.data("uid")));
                        t != o && (a.remove(n), a.insert(o, n), $("#buttons_dialog .change_button").addClass("k-state-selected"));
                    },
                }),
                $("#listview_buttons_list").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        e.event.preventDefault();
                        var a = $(e.event.target);
                        if (a.hasClass("listview_elem_delete")) {
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            $("#listview_buttons_list").data("kendoListView").remove(a.closest(".listview_elem")), $("#buttons_dialog .change_button").addClass("k-state-selected");
                        } else if (a.closest(".listview_elem").length && !a.hasClass("listview_elem_handler")) {
                            var t = $("#listview_buttons_list").data("kendoListView").dataItem(a.closest(".listview_elem"));
                            $("#input_button_command").val(decodeURI(t.Name)), $("#dropdown_button_panel").data("kendoDropDownList").value(t.Panel), $("#textarea_button_replacement").val(t.Replacement);
                        }
                    },
                }),
                $("#dropdown_action_team_role").kendoDropDownList({
                    optionLabel: "Rola twojej postaci...",
                    dataSource: jQuery.extend(!0, [], Conf.options.team_role),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    template: '<div class="dropdown_elem"><span class="icon fa #= data.Css_Icon #"></span><span>#= data.Text #</span><div>',
                }),
                $("#dropdown_action_team_role").closest(".k-dropdown").width(180),
                $("#multiselect_action_char_type").kendoMultiSelect({
                    placeholder: "Filtr celĂłw akcji...",
                    dataSource: jQuery.extend(!0, [], Conf.options.char_type),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    tagTemplate: '<div class="dropdown_elem"><span class="icon fa #= data.Css_Icon #"></span><span>#= data.Text #</span><div>',
                    itemTemplate: '<div class="dropdown_elem"><span class="icon fa #= data.Css_Icon #"></span><span>#= data.Text #</span><div>',
                }),
                $("#listview_actions_list").kendoListView({
                    dataTextField: "Name",
                    dataValueField: "Name",
                    dataSource: [],
                    template:
                        '<div class="listview_elem k-widget"><span class="listview_elem_right"><span class="listview_elem_delete fa fa-trash-o"></span></span><span class="listview_elem_left"><span class="listview_elem_handler fa fa-sort"></span>#= Conf.generate_actions_template(data) #<span class="listview_elem_large uppercase">#= Text.encode_html(decodeURI(data.Name)) #</span><span class="fa fa-long-arrow-right"></span><span>#= Text.style_multi_command(Text.encode_html(data.Replacement)) #</span></span></div>',
                }),
                $("#listview_actions_list").kendoSortable({
                    filter: ".listview_elem",
                    handler: ".listview_elem_handler",
                    placeholder: function (e) {
                        return e.clone().css("opacity", 0.5);
                    },
                    hint: function (e) {
                        return e.clone().css("color", e.css("color"));
                    },
                    change: function (e) {
                        var a = $("#listview_actions_list").data("kendoListView").dataSource,
                            t = e.oldIndex,
                            o = e.newIndex,
                            n = (a.data(), a.getByUid(e.item.data("uid")));
                        t != o && (a.remove(n), a.insert(o, n), $("#actions_dialog .change_button").addClass("k-state-selected"));
                    },
                }),
                $("#listview_actions_list").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        e.event.preventDefault();
                        var a = $(e.event.target);
                        if (a.hasClass("listview_elem_delete")) {
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            $("#listview_actions_list").data("kendoListView").remove(a.closest(".listview_elem")), $("#actions_dialog .change_button").addClass("k-state-selected");
                        } else if (a.closest(".listview_elem").length && !a.hasClass("listview_elem_handler")) {
                            var t = $("#listview_actions_list").data("kendoListView").dataItem(a.closest(".listview_elem"));
                            $("#input_action_command").val(decodeURI(t.Name)),
                                $("#multiselect_action_char_type").data("kendoMultiSelect").value(t.Char_Type),
                                $("#dropdown_action_team_role").data("kendoDropDownList").value(t.Team_Role),
                                $("#textarea_action_replacement").val(t.Replacement);
                        }
                    },
                }),
                $("#listview_patterns_list").kendoListView({
                    dataTextField: "Regexp",
                    dataValueField: "Regexp",
                    dataSource: [],
                    template:
                        '<div class="listview_elem k-widget"><span class="listview_elem_right"><span class="listview_elem_delete fa fa-trash-o"></span></span><span class="listview_elem_left"><span class="listview_elem_handler fa fa-sort"></span>#= Conf.generate_patterns_template(data) #<span class="fa fa-long-arrow-left"></span><span>#= Text.encode_html(data.Regexp) #</span></span></div>',
                }),
                $("#listview_patterns_list").kendoSortable({
                    filter: ".listview_elem",
                    handler: ".listview_elem_handler",
                    placeholder: function (e) {
                        return e.clone().css("opacity", 0.5);
                    },
                    hint: function (e) {
                        return e.clone().css("color", e.css("color"));
                    },
                    change: function (e) {
                        var a = $("#listview_patterns_list").data("kendoListView").dataSource,
                            t = e.oldIndex,
                            o = e.newIndex,
                            n = (a.data(), a.getByUid(e.item.data("uid")));
                        t != o && (a.remove(n), a.insert(o, n), $("#patterns_dialog .change_button").addClass("k-state-selected"));
                    },
                }),
                $("#dropdown_pattern_replacement_flag").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.patterns_replacement_flag),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        1 != this.value() ? ($("#input_pattern_replacement").val(""), $("#input_pattern_replacement").prop("disabled", !0)) : $("#input_pattern_replacement").prop("disabled", !1);
                    },
                }),
                $("#dropdown_pattern_color_flag").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.patterns_color_flag),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        1 != this.value()
                            ? ($("#colorpicker_pattern_color").data("kendoColorPicker").value("#ffffff"), $("#colorpicker_pattern_color").data("kendoColorPicker").enable(!1))
                            : $("#colorpicker_pattern_color").data("kendoColorPicker").enable(!0);
                    },
                }),
                $("#dropdown_pattern_sound_flag").kendoDropDownList({
                    dataSource: jQuery.extend(!0, [], Conf.options.patterns_sound_flag),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        1 != this.value()
                            ? ($("#dropdown_pattern_sound").data("kendoDropDownList").value(1), $("#dropdown_pattern_sound").data("kendoDropDownList").enable(!1))
                            : $("#dropdown_pattern_sound").data("kendoDropDownList").enable(!0);
                    },
                }),
                $("#dropdown_pattern_replacement_flag").closest(".k-dropdown").width(155),
                $("#dropdown_pattern_color_flag").closest(".k-dropdown").width(155),
                $("#dropdown_pattern_sound_flag").closest(".k-dropdown").width(155),
                $("#dropdown_pattern_sound").kendoDropDownList({ dataSource: jQuery.extend(!0, [], Conf.options.sounds), dataTextField: "Text", dataValueField: "Id" }),
                $("#dropdown_pattern_sound").closest(".k-dropdown").width(115),
                $("#colorpicker_pattern_color").kendoColorPicker({ buttons: !1 }),
                $("#listview_patterns_list").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        e.event.preventDefault();
                        var a = $(e.event.target);
                        if (a.hasClass("listview_elem_delete")) {
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            $("#listview_patterns_list").data("kendoListView").remove(a.closest(".listview_elem")), $("#patterns_dialog .change_button").addClass("k-state-selected");
                        } else if (a.closest(".listview_elem").length && !a.hasClass("listview_elem_handler")) {
                            var t = $("#listview_patterns_list").data("kendoListView").dataItem(a.closest(".listview_elem"));
                            $("#input_pattern_regexp").val(t.Regexp),
                                "string" == typeof t.Replacement
                                    ? ($("#dropdown_pattern_replacement_flag").data("kendoDropDownList").value(1), $("#input_pattern_replacement").val(t.Replacement), $("#input_pattern_replacement").prop("disabled", !1))
                                    : ($("#dropdown_pattern_replacement_flag").data("kendoDropDownList").value(2), $("#input_pattern_replacement").val(""), $("#input_pattern_replacement").prop("disabled", !0)),
                                t.Color
                                    ? ($("#dropdown_pattern_color_flag").data("kendoDropDownList").value(1),
                                        $("#colorpicker_pattern_color").data("kendoColorPicker").value(t.Color),
                                        $("#colorpicker_pattern_color").data("kendoColorPicker").enable(!0))
                                    : ($("#dropdown_pattern_color_flag").data("kendoDropDownList").value(2),
                                        $("#colorpicker_pattern_color").data("kendoColorPicker").value("#ffffff"),
                                        $("#colorpicker_pattern_color").data("kendoColorPicker").enable(!1)),
                                t.Sound
                                    ? ($("#dropdown_pattern_sound_flag").data("kendoDropDownList").value(1),
                                        $("#dropdown_pattern_sound").data("kendoDropDownList").value(t.Sound),
                                        $("#dropdown_pattern_sound").data("kendoDropDownList").enable(!0))
                                    : ($("#dropdown_pattern_sound_flag").data("kendoDropDownList").value(2), $("#dropdown_pattern_sound").data("kendoDropDownList").value(1), $("#dropdown_pattern_sound").data("kendoDropDownList").enable(!1));
                        }
                    },
                }),
                $("#upload_import_conf_from_file").on("change", function (e) {
                    var a = jQuery.extend(!0, {}, this.files);
                    if (($(this).val(""), a && 0 != a.length))
                        if (a.length > 1) $("#notification_game").data("kendoNotification").error("Musisz wskazaÄ jeden plik z konfiguracjÄ do zaimportowania.");
                        else {
                            var t = new FileReader();
                            (t.onload = function (e) {
                                Conf.import_from_file(t.result);
                            }),
                                (t.onerror = function (e) {
                                    $("#notification_game")
                                        .data("kendoNotification")
                                        .error("Nie udaĹo siÄ zaimportowaÄ konfiguracji z pliku (kod bĹÄdu: " + e.target.error.code + ").");
                                }),
                                t.readAsText(a[0]);
                        }
                }),
                $("#listview_import_conf").kendoListView({
                    dataTextField: "filename",
                    dataValueField: "filename",
                    dataSource: [],
                    template:
                        '<div class="listview_elem k-widget"><span class="listview_elem_right"><span class="listview_elem_small">#= kendo.toString(new Date(data.time * 1000), "g") #</span><span class="listview_elem_delete fa fa-trash-o"></span></span><span class="listview_elem_left"><span class="listview_elem_large">#= Text.decode_filename(data.filename) #</span></span></div>',
                }),
                $("#listview_import_conf").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        e.event.preventDefault();
                        var a = $(e.event.target);
                        if (a.hasClass("listview_elem_delete")) {
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("UsuniÄcie zapisu konfiguracji jest moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            var t = $("#listview_import_conf").data("kendoListView").dataItem(a.closest(".listview_elem")),
                                o = Text.decode_filename(t.filename);
                            $("#notification_game")
                                .data("kendoNotification")
                                .info(
                                    "Czy na pewno chcesz usunÄÄ zapis '" +
                                    o +
                                    "'?<div class='clear'></div><input type='submit' id='button_delete_conf_from_mud_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_delete_conf_from_mud_confirm", function () {
                                    if (null != Client.socket) {
                                        var e = {};
                                        (e.filename = Text.encode_filename(o)), Gmcp.send("client.conf.remove", JSON.stringify(e));
                                    } else $("#notification_game").data("kendoNotification").error("UsuniÄcie zapisu konfiguracji jest moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                                });
                        } else a.closest(".listview_elem").length && ((t = $("#listview_import_conf").data("kendoListView").dataItem(a.closest(".listview_elem"))), $("#input_export_conf").val(Text.decode_filename(t.filename)));
                    },
                }),
                $("#listview_panel_chars").kendoListView({ dataTextField: "desc", dataValueField: "id", dataSource: [], template: "#= Game.generate_panel_chars_template(data) #" }),
                $("#listview_panel_chars").kendoTouch({
                    doubleTapTimeout: 0,
                    tap: function (e) {
                        if ((e.event.preventDefault(), $(e.event.target).hasClass("panel_chars_enemy"))) {
                            var a = parseInt($(e.event.target).text());
                            if (!isNaN(a)) return void Game.show_actions_menu($("#listview_panel_chars .listview_elem").get(a));
                        }
                        var t = $(e.event.target).closest(".listview_elem");
                        if (!t.length || $(t).hasClass("k-state-focused")) return $("#popup_panel_chars").closest(".k-animation-container").hide(), void $("#listview_panel_chars .listview_elem.k-state-focused").removeClass("k-state-focused");
                        Game.show_actions_menu(t);
                    },
                }),
                $("#popup_panel_chars").kendoPopup({
                    animation: !1,
                    close: function (e) {
                        e.preventDefault();
                    },
                    collision: "fit",
                }),
                $("#maps_dialog").data("kendoWindow").title("Mapy").setOptions({ height: 600 }),
                $("#dropdown_maps_domain").kendoDropDownList({
                    optionLabel: "Wybierz domenÄ...",
                    dataSource: jQuery.extend(!0, [], Maps.options.domains),
                    dataTextField: "Text",
                    dataValueField: "Domain_Id",
                    change: function (e) {
                        Maps.refresh_area_map();
                    },
                }),
                $("#dropdown_maps_area").kendoDropDownList({
                    dataSource: { data: jQuery.extend(!0, [], Maps.options.areas), sort: { field: "Order_Num", dir: "asc" } },
                    cascadeFrom: "dropdown_maps_domain",
                    optionLabel: "Wybierz mapÄ...",
                    dataTextField: "Text",
                    dataValueField: "Map_Id",
                    filter: "contains",
                    change: function (e) {
                        Maps.refresh_area_map();
                    },
                }),
                $("#main_map_output").kendoMobileScroller({ elastic: !1 }),
                $("#main_map_output").on("wheel mousewheel DOMMouseScroll", function (e) {
                    if (!$("#maps_dialog").hasClass("map-domain")) {
                        var a = { x: Math.ceil(e.originalEvent.clientX - i.getBoundingClientRect().left - 7), y: Math.ceil(e.originalEvent.clientY - i.getBoundingClientRect().top - 7) };
                        return (
                            e.originalEvent.wheelDelta
                                ? e.originalEvent.wheelDelta > 0
                                    ? Maps.zoom_area_map(1, a)
                                    : e.originalEvent.wheelDelta < 0 && Maps.zoom_area_map(-1, a)
                                : e.originalEvent.deltaY < 0
                                    ? Maps.zoom_area_map(1, a)
                                    : e.originalEvent.deltaY > 0 && Maps.zoom_area_map(-1, a),
                                !1
                        );
                    }
                }),
                $("#button_maps_go_to_domain")
                    .data("kendoButton")
                    .bind("click", function (e) {
                        var a,
                            t = $("#dropdown_maps_area").data("kendoDropDownList");
                        (a = t.dataSource.filter()) && (t.dataSource.filter(a.filters[0]), t.filterInput.val("")), t.value([]), Maps.refresh_area_map();
                    }),
                $("#button_maps_zoom_in")
                    .data("kendoButton")
                    .bind("click", function (e) {
                        Maps.zoom_area_map(1);
                    }),
                $("#button_maps_zoom_out")
                    .data("kendoButton")
                    .bind("click", function (e) {
                        Maps.zoom_area_map(-1);
                    }),
                $("#button_maps_legend").on("click", function (e) {
                    $("#maps_legend_dialog").parent().is(":visible") ? $("#maps_legend_dialog").data("kendoWindow").toFront() : $("#maps_legend_dialog").data("kendoWindow").center().open();
                }),
                $("#maps_legend_dialog").data("kendoWindow").title("Legenda mapy").setOptions({ width: 400, resizable: !1 }),
                $("#main_map_output_wrapper").kendoTooltip({ filter: ".map_domain_link", width: 120, position: "top", callout: !1 }),
                $("#minimap_output").on("click", function (e) {
                    var a,
                        t = $("#dropdown_maps_area").data("kendoDropDownList"),
                        o = $("#dropdown_maps_domain").data("kendoDropDownList");
                    Maps.data.id &&
                    ($("#maps_dialog").parent().is(":visible") ? $("#maps_legend_dialog").data("kendoWindow").toFront() : $("#maps_dialog").data("kendoWindow").center().open(), t.value() != Maps.data.id) &&
                    ((a = t.dataSource.filter()) && (t.dataSource.filter(a.filters[0]), t.filterInput.val("")), o.value(Maps.data.domain), t.value(Maps.data.id), Maps.refresh_area_map());
                }),
                $("#minimap_output").on("wheel mousewheel DOMMouseScroll", function (e) {
                    return (
                        e.originalEvent.wheelDelta
                            ? e.originalEvent.wheelDelta > 0
                                ? Maps.zoom_minimap(1)
                                : e.originalEvent.wheelDelta < 0 && Maps.zoom_minimap(-1)
                            : e.originalEvent.deltaY < 0
                                ? Maps.zoom_minimap(1)
                                : e.originalEvent.deltaY > 0 && Maps.zoom_minimap(-1),
                            !1
                    );
                }),
                $("#logs_dialog")
                    .data("kendoWindow")
                    .title("Logi")
                    .setOptions({
                        height: 600,
                        close: function (e) {
                            $("#bottommenu_logs").hasClass("k-state-active")
                                ? $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_logs", !1)
                                : $("#bottommenu_logs_overflow > a").hasClass("k-state-active") && $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_logs_overflow", !1),
                                $("#logs_output_msg_wrapper").html(""),
                                $("#dropdown_logs_date").data("kendoDropDownList").setDataSource([]),
                                Logs.stop_replay();
                        },
                        resize: function (e) {
                            Scroller.check_down(Logs.element) && $("#logs_output").removeClass("k-state-selected");
                        },
                    }),
                $("#dropdown_logs_date").kendoDropDownList({
                    dataSource: [],
                    optionLabel: "Wybierz datÄ...",
                    select: function (e) {
                        if ($(e.item).hasClass("k-list-optionlabel")) $("#logs_output_msg_wrapper").html(""), $("#logs_dialog_actions").hide();
                        else {
                            var a = Storage.read(e.item.text() + "_" + Game.data.char.id, ""),
                                t = "";
                            "string" == typeof a
                                ? (t = LZString.decompressFromUTF16(a))
                                : Array.isArray(a) &&
                                $.each(a, function (e, a) {
                                    t += LZString.decompressFromUTF16(a);
                                }),
                            Logs.date == e.item.text() && (t += Logs.buffer),
                                $("#logs_output_msg_wrapper").html(t);
                            var o = kendo.parseDate(e.item.text()).getTime(),
                                n = 0;
                            $("#logs_output_msg_wrapper .output_msg").each(function () {
                                var a = $(this).children(".output_msg_time").text();
                                a ? ((a = kendo.parseDate(e.item.text() + " " + a, "yyyy-MM-dd HH:mm:ss.fff").getTime() + n), o > a && ((n += 864e5), (a += 864e5)), (o = a)) : (a = o), $(this).data("logs_timestamp", a);
                            }),
                                $("#logs_dialog_actions").show(),
                                $("#logs_dialog_actions").css("display", "inline"),
                                Scroller.move_up(Logs.element);
                        }
                    },
                }),
                $("#dropdown_logs_date").closest(".k-dropdown").width(130),
                $("#help_mud_dialog").data("kendoWindow").title("Pomoc do gry").setOptions({ height: 600 }),
                $("#dropdown_help_mud_category").kendoDropDownList({ optionLabel: "Wybierz kategorie...", dataSource: jQuery.extend(!0, [], Help_mud.options.categories), dataTextField: "Text", dataValueField: "Category_Id" }),
                $("#dropdown_help_mud_subject").kendoDropDownList({
                    filter: "contains",
                    cascadeFrom: "dropdown_help_mud_category",
                    optionLabel: "Wybierz temat...",
                    dataSource: [],
                    dataTextField: "Text",
                    dataValueField: "Subject_Id",
                    template: '<span class="italic">#: Text #</span>',
                    valueTemplate: '<span class="italic">#: Text #</span>',
                    change: function (e) {
                        Help_mud.refresh();
                    },
                }),
                $("#button_help_mud_back")
                    .data("kendoButton")
                    .bind("click", function (e) {
                        Help_mud.shift(-1);
                    }),
                $("#button_help_mud_forward")
                    .data("kendoButton")
                    .bind("click", function (e) {
                        Help_mud.shift(1);
                    }),
                $("#help_client_dialog").data("kendoWindow").title("Pomoc do klienta").setOptions({ height: 600 }),
                $("#dropdown_help_client_category").kendoDropDownList({
                    optionLabel: "Wybierz kategorie...",
                    dataSource: jQuery.extend(!0, [], Help_client.options.categories),
                    dataTextField: "Text",
                    dataValueField: "Id",
                    change: function (e) {
                        Help_client.refresh();
                    },
                }),
                $("#conf_dialog")
                    .data("kendoWindow")
                    .bind("close", function (e) {
                        if ($("#button_save_conf").hasClass("k-state-selected")) {
                            if (null == Client.socket) return;
                            $("#notification_login")
                                .data("kendoNotification")
                                .info(
                                    "Zmiany w ustawieniach klienta nie zostaĹy zapisane. Czy na pewno chcesz zamknÄÄ okno?<div class='clear'></div><input type='submit' id='button_close_conf_dialog_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_close_conf_dialog_confirm", function () {
                                    $("#conf_dialog .change_button").removeClass("k-state-selected"), $("#conf_dialog").data("kendoWindow").close();
                                }),
                                e.preventDefault();
                        }
                    })
                    .title("Ustawienia klienta")
                    .setOptions({ height: 600 }),
                $("#aliases_dialog")
                    .data("kendoWindow")
                    .bind("close", function (e) {
                        if ($("#button_save_aliases").hasClass("k-state-selected")) {
                            if (null == Client.socket) return;
                            $("#notification_login")
                                .data("kendoNotification")
                                .info(
                                    "Zmiany w konfiguracji aliasĂłw nie zostaĹy zapisane. Czy na pewno chcesz zamknÄÄ okno?<div class='clear'></div><input type='submit' id='button_close_aliases_dialog_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_close_aliases_dialog_confirm", function () {
                                    $("#aliases_dialog .change_button").removeClass("k-state-selected"), $("#aliases_dialog").data("kendoWindow").close();
                                }),
                                e.preventDefault();
                        }
                    })
                    .title("Aliasy")
                    .setOptions({ height: 600 }),
                $("#macros_dialog")
                    .data("kendoWindow")
                    .bind("close", function (e) {
                        if ($("#button_save_macros").hasClass("k-state-selected")) {
                            if (null == Client.socket) return;
                            $("#notification_login")
                                .data("kendoNotification")
                                .info(
                                    "Zmiany w konfiguracji makr nie zostaĹy zapisane. Czy na pewno chcesz zamknÄÄ okno?<div class='clear'></div><input type='submit' id='button_close_macros_dialog_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_close_macros_dialog_confirm", function () {
                                    $("#macros_dialog .change_button").removeClass("k-state-selected"), $("#macros_dialog").data("kendoWindow").close();
                                }),
                                e.preventDefault();
                        }
                    })
                    .title("Makra")
                    .setOptions({ height: 600 }),
                $("#buttons_dialog")
                    .data("kendoWindow")
                    .bind("close", function (e) {
                        if ($("#button_save_buttons").hasClass("k-state-selected")) {
                            if (null == Client.socket) return;
                            $("#notification_login")
                                .data("kendoNotification")
                                .info(
                                    "Zmiany w konfiguracji przyciskĂłw nie zostaĹy zapisane. Czy na pewno chcesz zamknÄÄ okno?<div class='clear'></div><input type='submit' id='button_close_buttons_dialog_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_close_buttons_dialog_confirm", function () {
                                    $("#buttons_dialog .change_button").removeClass("k-state-selected"), $("#buttons_dialog").data("kendoWindow").close();
                                }),
                                e.preventDefault();
                        }
                    })
                    .title("Przyciski")
                    .setOptions({ height: 600 }),
                $("#actions_dialog")
                    .data("kendoWindow")
                    .bind("close", function (e) {
                        if ($("#button_save_actions").hasClass("k-state-selected")) {
                            if (null == Client.socket) return;
                            $("#notification_login")
                                .data("kendoNotification")
                                .info(
                                    "Zmiany w konfiguracji akcji nie zostaĹy zapisane. Czy na pewno chcesz zamknÄÄ okno?<div class='clear'></div><input type='submit' id='button_close_actions_dialog_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_close_actions_dialog_confirm", function () {
                                    $("#actions_dialog .change_button").removeClass("k-state-selected"), $("#actions_dialog").data("kendoWindow").close();
                                }),
                                e.preventDefault();
                        }
                    })
                    .title("Akcje")
                    .setOptions({ height: 600 }),
                $("#patterns_dialog")
                    .data("kendoWindow")
                    .bind("close", function (e) {
                        if ($("#button_save_patterns").hasClass("k-state-selected")) {
                            if (null == Client.socket) return;
                            $("#notification_login")
                                .data("kendoNotification")
                                .info(
                                    "Zmiany w konfiguracji kolorĂłw i dĹşwiÄkĂłw nie zostaĹy zapisane. Czy na pewno chcesz zamknÄÄ okno?<div class='clear'></div><input type='submit' id='button_close_patterns_dialog_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_close_patterns_dialog_confirm", function () {
                                    $("#patterns_dialog .change_button").removeClass("k-state-selected"), $("#patterns_dialog").data("kendoWindow").close();
                                }),
                                e.preventDefault();
                        }
                    })
                    .title("PrzeksztaĹcanie tekstu")
                    .setOptions({ height: 600 }),
                $("#export_import_dialog").data("kendoWindow").title("Eksport/import konfiguracji").setOptions({ height: 600 }),
                $("#mud_dialog").data("kendoWindow").title("O Arkadii").setOptions({ minHeight: 200 }),
                $("#client_dialog").data("kendoWindow").title("O kliencie").setOptions({ minHeight: 200 }),
                $("#intro_dialog")
                    .data("kendoWindow")
                    .bind("close", function (e) {
                        $("#connect_window").show(), !$("html").hasClass("touch") && $("#input_connect_login").is(":visible") && $("#input_connect_login").focus();
                    })
                    .bind("open", function (e) {
                        $("#connect_window").hide();
                    })
                    .setOptions({ draggable: !1, resizable: !1, title: !1, width: 600, maxHeight: 600 }),
                $("#intro_dialog").parent().append('<img id="intro_dialog_img" src="images/logo.svg"/>'),
                $("#tutorial_dialog")
                    .data("kendoWindow")
                    .bind("open", function (e) {
                        $("#tutorial_dialog .tutorial_page").removeClass("tutorial_active_page"),
                            $("#tutorial_dialog .tutorial_page:first-child").addClass("tutorial_active_page"),
                            $("#tutorial_dialog")
                                .data("kendoWindow")
                                .setOptions({ title: "Samouczek - " + $("#tutorial_dialog .tutorial_active_page .tutorial_page_header").text() }),
                            $("#button_tutorial_back").hide(),
                            $("#button_tutorial_forward").show();
                    })
                    .setOptions({ resizable: !1, width: 600 }),
                $(".tutorial_show_menu").hover(
                    function () {
                        var e = $(this).attr("id").substring("tutorial_show_".length);
                        $("#topmenu_" + e + "_overflow > a").length
                            ? ($("#topmenu").data("kendoToolBar").popup.open(), $("#topmenu_" + e + "_overflow > a").addClass("k-state-focused"))
                            : $("#topmenu_conf_" + e).length && ($("#topmenu_conf_wrapper").data("kendoPopup").open(), $("#topmenu_conf_" + e).addClass("k-state-focused"));
                    },
                    function () {
                        var e = $(this).attr("id").substring("tutorial_show_".length);
                        $("#topmenu_" + e + "_overflow > a").length
                            ? (($("#topmenu").data("kendoToolBar").popup.options.animation.close.duration = 0),
                                $("#topmenu").data("kendoToolBar").popup.close(),
                                ($("#topmenu").data("kendoToolBar").popup.options.animation.close.duration = 300),
                                $("#topmenu_" + e + "_overflow > a").removeClass("k-state-focused"))
                            : $("#topmenu_conf_" + e).length &&
                            (($("#topmenu_conf_wrapper").data("kendoPopup").options.animation.close.duration = 0),
                                $("#topmenu_conf_wrapper").data("kendoPopup").close(),
                                ($("#topmenu_conf_wrapper").data("kendoPopup").options.animation.close.duration = 300),
                                $("#topmenu_conf_" + e).removeClass("k-state-focused"));
                    }
                ),
                $(".tutorial_show_menu").on("click", function (e) {
                    var a = $(this).attr("id").substring("tutorial_show_".length);
                    $("#topmenu_" + a + "_overflow > a").length
                        ? (a = $("#topmenu")
                            .data("kendoToolBar")
                            .options.items.filter(function (e, t, o) {
                                return e.id === "topmenu_" + a;
                            })[0]).click()
                        : $("#topmenu_conf_" + a).length &&
                        (a = $("#topmenu")
                            .data("kendoToolBar")
                            .options.items.filter(function (e, a, t) {
                                return "topmenu_conf" === e.id;
                            })[0]
                            .menuButtons.filter(function (e, t, o) {
                                return e.id === "topmenu_conf_" + a;
                            })[0]).click();
                }),
                $(".tutorial_show_element").hover(
                    function () {
                        var e = $(this).attr("id").substring("tutorial_show_".length);
                        $("#" + e).length ? $("#" + e).addClass("k-state-focused") : $("." + e).addClass("k-state-focused");
                    },
                    function () {
                        var e = $(this).attr("id").substring("tutorial_show_".length);
                        $("#" + e).length ? $("#" + e).removeClass("k-state-focused") : $("." + e).removeClass("k-state-focused");
                    }
                ),
                $(".tutorial_show_topmenu").hover(
                    function () {
                        var e = $(this).attr("id").substring("tutorial_show_".length);
                        $("#topmenu_" + e).addClass("k-state-selected");
                    },
                    function () {
                        var e = $(this).attr("id").substring("tutorial_show_".length);
                        $("#topmenu_" + e).removeClass("k-state-selected");
                    }
                ),
                $("#tutorial_show_user_input").on("click", function (e) {
                    $(Input.element).focus();
                }),
                $(".tutorial_send_command").on("click", function (e) {
                    var a = $(this).text(),
                        t = Input.element;
                    (t.value = a), t.setSelectionRange(a.length, a.length), Input.set_color();
                }),
                $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", function (e) {
                    document.fullscreenElement ||
                    document.mozFullScreenElement ||
                    document.webkitFullscreenElement ||
                    document.msFullscreenElement ||
                    ($("#bottommenu_full_screen").hasClass("k-state-active")
                        ? $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_full_screen", !1)
                        : $("#bottommenu_full_screen_overflow > a").hasClass("k-state-active") && $("#bottommenu").data("kendoToolBar").toggle("#bottommenu_full_screen_overflow", !1));
                }),
                $(document).on("visibilitychange mozvisibilitychange msvisibilitychange webkitvisibilitychange", function (e) {
                    if ((Client.check_connection(), $("html").hasClass("k-mobile")))
                        if ("hidden" == document.visibilityState) ((a = {}).disabled = !0), Gmcp.send("core.keepalive", JSON.stringify(a));
                        else if ("visible" == document.visibilityState) {
                            var a = { disabled: !1 };
                            Gmcp.send("core.keepalive", JSON.stringify(a));
                        }
                }),
                $("html").hasClass("k-mobile") &&
                ($(".text_output").kendoMobileScroller({
                    elastic: !1,
                    scroll: function (e) {
                        var a = $(e.sender.element).get(0);
                        Scroller.check_down(a) && $(a).removeClass("k-state-selected");
                    },
                }),
                    $(".text_output > .km-scroll-container").append("<br>")),
                $("html").hasClass("touch") &&
                ($(o).kendoTouch({
                    enableSwipe: !0,
                    maxDuration: 2e3,
                    swipe: function (e) {
                        "left" == e.direction ? Input.history_up() : "right" == e.direction && Input.history_down();
                    },
                }),
                    $(n).kendoTouch({
                        enableSwipe: !0,
                        maxDuration: 2e3,
                        minXDelta: 50,
                        swipe: function (e) {
                            "left" == e.direction ? (Touch.shift(-1), Touch.refresh(-1), Client.resize()) : "right" == e.direction && (Touch.shift(1), Touch.refresh(1), Client.resize()), Client.resize();
                        },
                    }),
                    $("#main_map_output, .text_output").on("touchstart", function (e) {
                        e.originalEvent.touches.length > 1 && $(this).data("kendoMobileScroller").disable();
                    }),
                    $("#main_map_output, .text_output").on("touchend touchcancel", function (e) {
                        e.originalEvent.touches.length <= 1 && ($(this).data("distance", 0), $(this).data("kendoMobileScroller").enable());
                    }),
                    $(".text_output").kendoTouch({
                        multiTouch: !0,
                        gesturechange: function (e) {
                            if (e.event.target) {
                                var a = $(e.event.target).closest(".text_output").get(0),
                                    t = $(a).find(".text_output_msg_wrapper").get(0),
                                    o = $(a).data("distance");
                                if (o) {
                                    if (e.distance - o > 20 || o - e.distance > 20) {
                                        var n,
                                            i = Number(
                                                $(t)
                                                    .css("font-size")
                                                    .match(/(\d*(\.\d*)?)px/)[1]
                                            );
                                        Scroller.check_up(a) ? (n = 1) : Scroller.check_down(a) && (n = -1),
                                            e.distance - o < 0 ? i-- : e.distance - o > 0 && i++,
                                            (i = Math.min(Math.max(i, 5), 18)),
                                            $(t).css("font-size", i + "px"),
                                            n > 0 ? Scroller.move_up(a) : n < 0 ? Scroller.move_down(a) : Scroller.refresh(a),
                                            $(a).data("distance", e.distance);
                                    }
                                } else $(a).data("distance", e.distance);
                            }
                        },
                    }),
                    $("#main_map_output").kendoTouch({
                        multiTouch: !0,
                        gesturechange: function (e) {
                            if (!$("#maps_dialog").hasClass("map-domain")) {
                                var a = $("#main_map_output").data("distance");
                                if (a) {
                                    if (e.distance - a > 20 || a - e.distance > 20) {
                                        var t = { x: Math.ceil(e.center.x - i.getBoundingClientRect().left - 7), y: Math.ceil(e.center.y - i.getBoundingClientRect().top - 7) };
                                        Maps.zoom_area_map(e.distance - a > 0 ? 1 : -1, t), $("#main_map_output").data("distance", e.distance);
                                    }
                                } else $("#main_map_output").data("distance", e.distance);
                            }
                        },
                        doubletap: function (e) {
                            $("#maps_dialog").hasClass("map-domain") || Scroller.center_position(Maps.element);
                        },
                    }),
                    $("#minimap_output").kendoTouch({
                        multiTouch: !0,
                        gesturechange: function (e) {
                            var a = $("#minimap_output").data("distance");
                            a
                                ? (e.distance - a > 20 || a - e.distance > 20) &&
                                (Math.ceil(e.center.x - i.getBoundingClientRect().left - 7),
                                    Math.ceil(e.center.y - i.getBoundingClientRect().top - 7),
                                    Maps.zoom_minimap(e.distance - a > 0 ? 1 : -1),
                                    $("#minimap_output").data("distance", e.distance))
                                : $("#minimap_output").data("distance", e.distance);
                        },
                    }),
                    $(o).kendoTouch({
                        doubleTapTimeout: 0,
                        tap: function (e) {
                            var a = Conf.data.touch_panels.indexOf("keyboard");
                            a > -1 &&
                            Touch.index != a &&
                            ($("#bottommenu_keyboard").hasClass("k-state-active") || $("#bottommenu_keyboard_overflow > a").hasClass("k-state-active")) &&
                            ((Touch.index = a), Touch.refresh(), Client.resize(), e.event.preventDefault());
                        },
                    }),
                    $("html").hasClass("mobile-iOS")))
        ) {
            var s = !1;
            $(window).on("touchstart", function (e) {
                s = !0;
            }),
                $(window).on("touchmove", function (e) {
                    s && (e.preventDefault(), (s = !1));
                }),
                $("a").on("click", function (e) {
                    if ($("html").hasClass("mobile-standalone") && e.target.href && "_blank" == e.target.target) return confirm("KontynuujÄc utracisz poĹÄczenie z ArkadiÄ.");
                });
        }
        $(window).resize(function (e) {
            Client.resize();
        }),
            (onclick = function (e) {
                $("html").hasClass("game") || Gmcp.send("core.ping");
            }),
            (onkeydown = function (e) {
                var a,
                    t = $("input, textarea, select").not(":input[type=button], :input[type=submit], :input[type=reset]");
                if (13 == (e = e || window.event).keyCode) {
                    if (!$("html").hasClass("game")) return (t.is(":focus") || $("#intro_dialog").is(":visible")) && $(".main_button:visible").click(), Gmcp.send("core.ping"), e.preventDefault(), !1;
                    if (!t.is(":focus") || $(o).is(":focus")) return e.shiftKey ? (Input.element.value += String.fromCharCode(8629)) : Input.process_input(), e.preventDefault(), !1;
                }
                if (8 == e.keyCode && !t.is(":focus") && !$(o).is(":focus")) return $(o).focus(), !0;
                if (!$("html").hasClass("game")) return !0;
                if (document.activeElement && $(document.activeElement).hasClass("k-dropdown") && $(document.activeElement).children("#dropdown_macro_key").length) {
                    var n = !1;
                    if (
                        ($.each(Conf.options.macros, function (a, t) {
                            if (String(e.keyCode) == t.Id) return (n = t.Text), !1;
                        }),
                            n)
                    )
                        return e.ctrlKey ? (n = "CTRL " + n) : e.altKey && (n = "ALT " + n), $("#dropdown_macro_key").data("kendoDropDownList").value(n), e.preventDefault(), !1;
                }
                if (!e.ctrlKey && !e.altKey) {
                    switch (e.keyCode) {
                        case 38:
                            return $(o).focus(), Input.history_up(), e.preventDefault(), !1;
                        case 40:
                            return $(o).focus(), Input.history_down(), e.preventDefault(), !1;
                    }
                    if ($("html").hasClass("macros") && $.isPlainObject(Conf.data.macros) && $.isPlainObject(Conf.data.macros[e.keyCode]) && (a = Conf.data.macros[e.keyCode].general))
                        return (
                            e.preventDefault(),
                                !1 !== (i = Input.check_variables(a))
                                    ? $.each(i.split(/\n/), function (e, a) {
                                        Input.send(a);
                                    })
                                    : Output.send(Text.style_blocked_command(Text.encode_html(a)), "command"),
                                !1
                        );
                    if (33 == e.keyCode || 34 == e.keyCode) return;
                    t.is(":focus") || $(o).is(":focus") || $(o).focus();
                }
                if ($("html").hasClass("macros") && !e.ctrlKey && e.altKey && $.isPlainObject(Conf.data.macros) && $.isPlainObject(Conf.data.macros[e.keyCode]) && (a = Conf.data.macros[e.keyCode].alt))
                    return (
                        e.preventDefault(),
                            !1 !== (i = Input.check_variables(a))
                                ? $.each(i.split(/\n/), function (e, a) {
                                    Input.send(a);
                                })
                                : Output.send(Text.style_blocked_command(Text.encode_html(a)), "command"),
                            !1
                    );
                if (e.ctrlKey) {
                    if (-1 != jQuery.inArray(e.keyCode, [86, 88]) && !t.is(":focus") && !$(o).is(":focus")) return $(o).focus(), !0;
                    if ($("html").hasClass("macros") && !e.altKey && $.isPlainObject(Conf.data.macros) && $.isPlainObject(Conf.data.macros[e.keyCode]) && (a = Conf.data.macros[e.keyCode].ctrl)) {
                        e.preventDefault();
                        var i = Input.check_variables(a);
                        return (
                            !1 !== i
                                ? $.each(i.split(/\n/), function (e, a) {
                                    Input.send(a);
                                })
                                : Output.send(Text.style_blocked_command(Text.encode_html(a)), "command"),
                                !1
                        );
                    }
                }
                return e.keyCode >= 112 && e.keyCode <= 123 ? (e.preventDefault(), !1) : void 0;
            }),
            $(".button").kendoButton({
                click: function (e) {
                    switch ($(this.element).attr("id")) {
                        case "button_login":
                            var a = $("#input_connect_login").val(),
                                t = $("#input_connect_password").val(),
                                o = $("#connect_window .notification").data("kendoNotification");
                            if (!a) return $("#input_connect_login").focus(), void o.error("Musisz podaÄ imiÄ istniejÄcej postaci lub adres email konta, by mĂłc stworzyÄ nowÄ.");
                            if (a != Text.filter_alphanumeric(a))
                                return $("#input_connect_login").focus(), void (-1 === a.indexOf("@") ? o.error("Wprowadzone imiÄ zawiera niedozwolone znaki.") : o.error("Wprowadzony adres email zawiera niedozwolone znaki."));
                            if (!t) return $("#input_connect_password").focus(), void o.error("Musisz podaÄ poprawne hasĹo.");
                            if (t != Text.filter_alphanumeric(t)) return $("#input_connect_password").focus(), void o.error("Wprowadzone hasĹo zawiera niedozwolone znaki.");
                            var n,
                                i = {};
                            -1 === a.indexOf("@") ? ((n = "char.login"), (i.name = a)) : ((n = "account.login"), (i.email = a)),
                                (i.password = t),
                                Gmcp.send(n, JSON.stringify(i)),
                            $("html").hasClass("mobile-iOS") &&
                            $.each(Conf.options.sounds, function (e, a) {
                                a.Sound.load();
                            });
                            break;
                        case "button_create_account":
                            var s = $("#input_create_account").val();
                            o = $("#create_account_window .notification").data("kendoNotification");
                            if (!s) return $("#input_create_account").focus(), void o.error("Musisz podaÄ adres email, do ktĂłrego zostanie przypisane nowe konto.");
                            if (-1 === s.indexOf("@") || s != Text.filter_alphanumeric(s)) return $("#input_create_account").focus(), void o.error("Musisz podaÄ poprawny adres email.");
                            $("#notification_login")
                                .data("kendoNotification")
                                .info(
                                    "Czy adres email " +
                                    s +
                                    " jest na pewno poprawny?<div class='clear'></div><input type='submit' id='button_create_account_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_create_account_confirm", function () {
                                    var e = {};
                                    (e.email = s), Gmcp.send("account.create", JSON.stringify(e));
                                });
                            break;
                        case "button_randomize_appearance":
                            Account.set_adjectives_datasources(!0);
                            break;
                        case "button_generate_name":
                            (r = Account.generate_name($("#dropdown_set_race").data("kendoDropDownList").text())), $("#input_char_name").val(r), Account.check_name();
                            break;
                        case "button_create_char":
                            var r = $("#input_char_name").val(),
                                l = $("#input_name_nominative").val(),
                                d = $("#input_name_genitive").val(),
                                c = $("#input_name_dative").val(),
                                p = $("#input_name_accusative").val(),
                                _ = $("#input_name_instrumental").val(),
                                u = $("#input_name_locative").val(),
                                m = parseInt($("#dropdown_set_race").data("kendoDropDownList").value()),
                                f = $("#dropdown_set_race").data("kendoDropDownList").text(),
                                h = parseInt($("#dropdown_set_gender").data("kendoDropDownList").value()),
                                g = $("#dropdown_set_first_adjective").data("kendoDropDownList").value(),
                                k = $("#dropdown_set_second_adjective").data("kendoDropDownList").value(),
                                w = parseInt($("#dropdown_set_startloc").data("kendoDropDownList").value()),
                                v = $("#dropdown_set_startloc").data("kendoDropDownList").text();
                            o = $("#notification_create_char").data("kendoNotification");
                            if (!r) return $("#input_char_name").focus(), void o.error("Musisz wybraÄ imiÄ dla postaci.");
                            if (r != Text.filter_alphabetic(r)) return $("#input_char_name").focus(), void o.error("ImiÄ zawiera niedozwolone znaki.");
                            if (!(l && l == r && d && c && p && _ && u)) return $("#input_name_genitive").focus(), void o.error("Musisz podaÄ poprawnÄ odmianÄ imienia.");
                            if (l != Text.filter_alphabetic(l) || d != Text.filter_alphabetic(d) || c != Text.filter_alphabetic(c) || p != Text.filter_alphabetic(p) || _ != Text.filter_alphabetic(_) || u != Text.filter_alphabetic(u))
                                return $("#input_name_genitive").focus(), void o.error("Odmiana imienia zawiera niedozwolone znaki.");
                            if (isNaN(m)) return $("#dropdown_set_race").focus(), void o.error("Musisz wybraÄ rasÄ postaci.");
                            if (isNaN(h)) return $("#dropdown_set_gender").focus(), void o.error("Musisz wybraÄ pĹeÄ postaci.");
                            if (!g || !k || g == k) return $("#dropdown_set_first_adjective").focus(), void o.error("Musisz wybraÄ dwa rĂłĹźne przymiotniki opisujÄce wyglÄd postaci.");
                            if (isNaN(w)) return $("#dropdown_set_startloc").focus(), void o.error("Musisz wybraÄ miejsce rozpoczÄcia gry.");
                            $("#notification_account")
                                .data("kendoNotification")
                                .info(
                                    "Twoja postaÄ bÄdzie " +
                                    Account.generate_short_instrumental(f, h, g, k) +
                                    ", znan" +
                                    (h ? "Ä" : "ym") +
                                    " jako " +
                                    Text.capitalize(l) +
                                    ".<div class='clear'></div>Rozpocznie swojÄ przygodÄ w " +
                                    ("Nuln" == Text.capitalize(v) ? "Nuln" : "Novigradzie") +
                                    ".<div class='clear'></div>Czy wszystko to jest na pewno poprawne?<div class='clear'></div><input type='submit' id='button_create_char_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                                ),
                                $(".k-notification").on("click", "#button_create_char_confirm", function () {
                                    var e = {};
                                    (e.name_declension = [l, d, c, p, _, u]), (e.race = m), (e.gender = h), (e.adjectives = [g, k]), (e.startloc = w), Gmcp.send("char.create", JSON.stringify(e));
                                });
                            break;
                        case "button_toggle_block_char":
                            var b = $("#listview_chars_list").data("kendoListView").select();
                            o = $("#acount_menu_chars .notification").data("kendoNotification");
                            if (!b.text()) return void o.error("Musisz wybraÄ postaÄ do zablokowania.");
                            ((i = {}).name = b.text()), b.hasClass("line_through") ? Gmcp.send("char.unblock", JSON.stringify(i)) : Gmcp.send("char.block", JSON.stringify(i));
                            break;
                        case "button_login_char":
                            (b = $("#listview_chars_list").data("kendoListView").select()), (o = $("#acount_menu_chars .notification").data("kendoNotification"));
                            if (!b.text()) return void o.error("Musisz wybraÄ postaÄ, na ktĂłrÄ chcesz siÄ zalogowaÄ.");
                            ((i = {}).name = b.text()), Gmcp.send("char.login", JSON.stringify(i));
                            break;
                        case "button_block_account":
                            t = $("#input_block_account_password").val();
                            var y = Text.get_date($("#datetime_picker_block_account").val()).valueOf() / 1e3;
                            o = $("#acount_menu_block_account .notification").data("kendoNotification");
                            if (!t) return $("#input_block_account_password").focus(), void o.error("Musisz podaÄ poprawne hasĹo.");
                            if (t != Text.filter_alphanumeric(t)) return $("#input_block_account_password").focus(), void o.error("Wprowadzone hasĹo zawiera niedozwolone znaki.");
                            if (isNaN(y)) return $("#datetime_picker_block_account").focus(), void o.error("Musisz podaÄ datÄ i godzinÄ koĹca blokady konta.");
                            ((i = {}).time = y), (i.password = t), Gmcp.send("account.block", JSON.stringify(i));
                            break;
                        case "button_unblock_account":
                            Gmcp.send("account.unblock");
                            break;
                        case "button_change_email":
                            (t = $("#input_change_email_password").val()), (s = $("#input_change_email").val()), (o = $("#acount_menu_change_email .notification").data("kendoNotification"));
                            if (!t) return $("#input_change_email_password").focus(), void o.error("Musisz podaÄ poprawne hasĹo.");
                            if (t != Text.filter_alphanumeric(t)) return $("#input_change_email_password").focus(), void o.error("Wprowadzone hasĹo zawiera niedozwolone znaki.");
                            if (!s) return $("#input_change_email").focus(), void o.error("Musisz podaÄ nowy adres email dla konta.");
                            if (-1 === s.indexOf("@") || s != Text.filter_alphanumeric(s)) return $("#input_change_email").focus(), void o.error("Musisz podaÄ poprawny adres email.");
                            ((i = {}).password = t), (i.new_email = s), Gmcp.send("account.change.email", JSON.stringify(i));
                            break;
                        case "button_change_password":
                            var C = $("#input_change_password_old").val(),
                                x = $("#input_change_password_first").val(),
                                z = $("#input_change_password_second").val();
                            o = $("#acount_menu_change_password .notification").data("kendoNotification");
                            if (!C) return $("#input_change_password_old").focus(), void o.error("Musisz podaÄ dotychczasowe hasĹo.");
                            if (C != Text.filter_alphanumeric(C)) return $("#input_change_password_old").focus(), void o.error("Wprowadzone stare hasĹo zawiera niedozwolone znaki.");
                            if (!x) return $("#input_change_password_first").focus(), void o.error("Musisz podaÄ nowe hasĹo.");
                            if (!z) return $("#input_change_password_second").focus(), void o.error("Musisz jeszcze raz podaÄ nowe hasĹo.");
                            if (x != Text.filter_alphanumeric(x)) return $("#input_change_password_first").focus(), void o.error("Wprowadzone nowe hasĹo zawiera niedozwolone znaki.");
                            if ($("#input_change_password_first").val() != $("#input_change_password_second").val()) return $("#input_change_password_first").focus(), void o.error("Musisz podaÄ to samo nowe hasĹo w obu polach.");
                            ((i = {}).old_password = C), (i.new_password = x), Gmcp.send("account.change.password", JSON.stringify(i));
                            break;
                        case "button_intro_go_to_create_account":
                            $("#intro_dialog").data("kendoWindow").close();
                        case "button_go_to_create_account":
                            $(".login_window .k-textbox").val(""), $(".login_window").hide(), $("#create_account_window").show(), $("html").hasClass("touch") || $("#input_create_account").focus();
                            break;
                        case "button_intro_go_to_connect":
                            $("#intro_dialog").data("kendoWindow").close();
                        case "button_go_to_connect":
                            $(".login_window .k-textbox").val(""),
                                $(".login_window").hide(),
                                $(".connect_window_body").hide(),
                                $("#login_body").show(),
                                $("#connect_window").show(),
                            $("html").hasClass("touch") || $("#input_connect_login").focus();
                            break;
                        case "button_go_to_account_menu":
                            $(".account_window .k-textbox").val(""), $(".account_window").hide(), $("#account_menu_window").show();
                            break;
                        case "button_go_to_create_char":
                            $(".account_window .k-textbox").val(""), $(".account_window").hide(), $("#create_char_window").show();
                            break;
                        case "button_show_topmenu":
                            $("html").hasClass("topmenu_hidden") && ($("html").removeClass("topmenu_hidden"), Client.resize());
                            break;
                        case "button_play_replay_logs":
                            Logs.replay_timeout
                                ? Logs.pause_replay()
                                : ($("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").length ||
                                ($("#logs_output_msg_wrapper .output_msg:visible").addClass("logs_msg_replay_waiting"),
                                    Logs.set_replay($("#logs_output_msg_wrapper .output_msg.logs_msg_replay_waiting").first().data("logs_timestamp"))),
                                    Logs.play_replay());
                            break;
                        case "button_backward_replay_logs":
                            Logs.backward_replay();
                            break;
                        case "button_forward_replay_logs":
                            Logs.forward_replay();
                            break;
                        case "button_stop_replay_logs":
                            Logs.stop_replay();
                            break;
                        case "button_replay_logs":
                            Logs.start_replay();
                            break;
                        case "button_save_logs":
                            Logs.save_to_file();
                            break;
                        case "button_tutorial_back":
                            var T = $("#tutorial_dialog .tutorial_page.tutorial_active_page").prev();
                            T.length &&
                            ($("#tutorial_dialog .tutorial_page").removeClass("tutorial_active_page"),
                                $(T).addClass("tutorial_active_page"),
                                $("#tutorial_dialog")
                                    .data("kendoWindow")
                                    .setOptions({ title: "Samouczek - " + $("#tutorial_dialog .tutorial_active_page .tutorial_page_header").text() }),
                            $(T).prev().length || $("#button_tutorial_back").hide(),
                                $("#button_tutorial_forward").show());
                            break;
                        case "button_tutorial_forward":
                            var I = $("#tutorial_dialog .tutorial_page.tutorial_active_page").next();
                            I.length &&
                            ($("#tutorial_dialog .tutorial_page").removeClass("tutorial_active_page"),
                                $(I).addClass("tutorial_active_page"),
                                $("#tutorial_dialog")
                                    .data("kendoWindow")
                                    .setOptions({ title: "Samouczek - " + $("#tutorial_dialog .tutorial_active_page .tutorial_page_header").text() }),
                            $(I).next().length || $("#button_tutorial_forward").hide(),
                                $("#button_tutorial_back").show());
                            break;
                        case "button_export_conf_to_file":
                            Conf.export_to_file();
                            break;
                        case "button_export_conf_to_mud":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            var j = $("#listview_import_conf").data("kendoListView"),
                                S = $("#input_export_conf").val(),
                                D = ((o = $("#notification_game").data("kendoNotification")), !1);
                            if (!S) return $("#input_export_conf").focus(), void o.error("Musisz podaÄ nazwÄ dla zapisu konfiguracji.");
                            if (S.length > 20) return $("#input_export_conf").focus(), void o.error("Nazwa zapisu nie moĹźe byÄ dĹuĹźsza niĹź 20 znakĂłw.");
                            if (" " == S.slice(0, 1) || " " == S.slice(-1)) return $("#input_export_conf").focus(), void o.error("Nazwa zapisu nie moĹźe zaczynaÄ siÄ lub koĹczyÄ spacjÄ.");
                            if (
                                ($.each($("#listview_import_conf div"), function (e, a) {
                                    if (j.dataItem($(a)).filename == Text.encode_filename(S)) return (D = !0), !1;
                                }),
                                    !D)
                            )
                                return (
                                    ((i = {}).data = Text.compress(JSON.stringify(Conf.encode(Conf.data)))),
                                        (i.md5 = md5(i.data)),
                                        (i.compressed = !0),
                                        (i.decoded_filename = encodeURI(S)),
                                        (i.charname = Game.data.char.name),
                                        (i.filename = Text.encode_filename(S)),
                                        void (!0 !== Gmcp.send("client.conf.set", JSON.stringify(i)) && $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana."))
                                );
                            o.info(
                                "Czy na pewno chcesz nadpisaÄ poprzedni zapis o nazwie '" +
                                S +
                                "'?<div class='clear'></div><input type='submit' id='button_export_conf_to_mud_confirm' class='notification_button' title='WciĹnij, aby potwierdziÄ.' value='Tak'> <input type='submit' class='notification_button' title='WciĹnij, aby przerwaÄ.' value='Nie'>"
                            ),
                                $(".k-notification").on("click", "#button_export_conf_to_mud_confirm", function () {
                                    if (null != Client.socket) {
                                        var e = {};
                                        (e.data = Text.compress(JSON.stringify(Conf.encode(Conf.data)))),
                                            (e.md5 = md5(e.data)),
                                            (e.compressed = !0),
                                            (e.decoded_filename = encodeURI(S)),
                                            (e.charname = Game.data.char.name),
                                            (e.filename = Text.encode_filename(S)),
                                        !0 !== Gmcp.send("client.conf.set", JSON.stringify(e)) && $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.");
                                    } else $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                                });
                            break;
                        case "button_import_conf_from_mud":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Wczytanie zapisu konfiguracji jest moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            (j = $("#listview_import_conf").data("kendoListView")), (S = $("#input_export_conf").val()), (o = $("#notification_game").data("kendoNotification")), (D = !1);
                            if (!S) return $("#input_export_conf").focus(), void o.error("Musisz podaÄ nazwÄ zapisu konfiguracji do wczytania.");
                            if (
                                ($.each($("#listview_import_conf div"), function (e, a) {
                                    if (j.dataItem($(a)).filename == Text.encode_filename(S)) return (D = !0), !1;
                                }),
                                    !D)
                            )
                                return $("#input_export_conf").focus(), void o.error("Nie ma zapisu konfiguracji o takiej nazwie.");
                            ((i = {}).filename = Text.encode_filename(S)), Gmcp.send("client.conf.get", JSON.stringify(i));
                            break;
                        case "button_set_ansi_default":
                            $("#colorpicker_conf_ansi_black_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[0]),
                                $("#colorpicker_conf_ansi_red_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[1]),
                                $("#colorpicker_conf_ansi_green_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[2]),
                                $("#colorpicker_conf_ansi_yellow_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[3]),
                                $("#colorpicker_conf_ansi_blue_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[4]),
                                $("#colorpicker_conf_ansi_magneta_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[5]),
                                $("#colorpicker_conf_ansi_cyan_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[6]),
                                $("#colorpicker_conf_ansi_white_dark").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.dark[7]),
                                $("#colorpicker_conf_ansi_black_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[0]),
                                $("#colorpicker_conf_ansi_red_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[1]),
                                $("#colorpicker_conf_ansi_green_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[2]),
                                $("#colorpicker_conf_ansi_yellow_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[3]),
                                $("#colorpicker_conf_ansi_blue_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[4]),
                                $("#colorpicker_conf_ansi_magneta_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[5]),
                                $("#colorpicker_conf_ansi_cyan_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[6]),
                                $("#colorpicker_conf_ansi_white_bright").data("kendoColorPicker").value(Conf.defaults.color_codes.ansi.bright[7]),
                                $("#conf_dialog .change_button").addClass("k-state-selected");
                            break;
                        case "button_save_conf":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            if (
                                (((N = jQuery.extend(!0, {}, Conf.data)).theme_type = $("#dropdown_conf_theme").data("kendoDropDownList").dataItem().Id),
                                    (N.font_type = $("#dropdown_conf_font_type").data("kendoDropDownList").dataItem().Id),
                                    (N.font_size = $("#dropdown_conf_font_size").data("kendoDropDownList").dataItem().Id),
                                    (N.logging = $("#dropdown_conf_logging").data("kendoDropDownList").dataItem().Id),
                                    (N.logging_times = $("#dropdown_conf_logging_times").data("kendoDropDownList").dataItem().Id),
                                    (N.output_times = $("#dropdown_conf_output_times").data("kendoDropDownList").dataItem().Id),
                                    (N.output_limit = $("#dropdown_conf_output_limit").data("kendoDropDownList").dataItem().Id),
                                    (N.output_command_echo = $("#dropdown_conf_output_command_echo").data("kendoDropDownList").dataItem().Id),
                                    (N.background_map = $("#dropdown_conf_background_map").data("kendoDropDownList").dataItem().Id),
                                    (N.history_limit = $("#dropdown_conf_history_limit").data("kendoDropDownList").dataItem().Id),
                                    (N.input_echo = $("#dropdown_conf_input_echo").data("kendoDropDownList").dataItem().Id),
                                    (N.input_split = $("#dropdown_conf_input_split").data("kendoDropDownList").dataItem().Id),
                                    (N.input_variables = $("#dropdown_conf_input_variables").data("kendoDropDownList").dataItem().Id),
                                    (N.blocking_variables = $("#dropdown_conf_blocking_variables").data("kendoDropDownList").dataItem().Id),
                                    (N.panel_chars_order = $("#dropdown_conf_panel_chars_order").data("kendoDropDownList").dataItem().Id),
                                    (N.actions_popup_position = $("#dropdown_conf_actions_popup_position").data("kendoDropDownList").dataItem().Id),
                                    (N.side_buttons_position = $("#dropdown_conf_side_buttons_position").data("kendoDropDownList").dataItem().Id),
                                    (N.touch_panels = $("#multiselect_conf_touch_panels").data("kendoMultiSelect").value()),
                                    (N.extra_history = jQuery.extend(!0, [], $("#multiselect_conf_extra_history").data("kendoTagList").value())),
                                    (N.panels = {}),
                                    (N.panels.top = $("#multiselect_conf_panel_top").data("kendoMultiSelect").value()),
                                    (N.panels.right = $("#multiselect_conf_panel_right").data("kendoMultiSelect").value()),
                                    (N.panels.bottom = $("#multiselect_conf_panel_bottom").data("kendoMultiSelect").value()),
                                    (N.panels.left = $("#multiselect_conf_panel_left").data("kendoMultiSelect").value()),
                                    (N.color_codes = {}),
                                    (N.color_codes.progressbars = {}),
                                    (N.color_codes.progressbars.kondycja = $("#colorpicker_conf_health_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.mana = $("#colorpicker_conf_mana_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.zmeczenie = $("#colorpicker_conf_fatigue_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.obciazenie = $("#colorpicker_conf_encumbrance_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.panika = $("#colorpicker_conf_panic_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.glod = $("#colorpicker_conf_stuffed_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.pragnienie = $("#colorpicker_conf_soaked_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.upicie = $("#colorpicker_conf_intox_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.kac = $("#colorpicker_conf_headache_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.postepy = $("#colorpicker_conf_exp_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.progressbars.forma = $("#colorpicker_conf_form_bar").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars = {}),
                                    (N.color_codes.panel_chars.attack_target = $("#colorpicker_conf_char_attack_target").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars.defense_target = $("#colorpicker_conf_char_defense_target").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars.avatar_target = $("#colorpicker_conf_char_avatar_target").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars.team_leader = $("#colorpicker_conf_char_team_leader").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars.neutral = $("#colorpicker_conf_char_neutral").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars.enemy = $("#colorpicker_conf_char_enemy").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars.team = $("#colorpicker_conf_char_team").data("kendoColorPicker").value()),
                                    (N.color_codes.panel_chars.avatar = $("#colorpicker_conf_char_avatar").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi = {}),
                                    (N.color_codes.ansi.dark = []),
                                    (N.color_codes.ansi.dark[0] = $("#colorpicker_conf_ansi_black_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.dark[1] = $("#colorpicker_conf_ansi_red_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.dark[2] = $("#colorpicker_conf_ansi_green_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.dark[3] = $("#colorpicker_conf_ansi_yellow_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.dark[4] = $("#colorpicker_conf_ansi_blue_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.dark[5] = $("#colorpicker_conf_ansi_magneta_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.dark[6] = $("#colorpicker_conf_ansi_cyan_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.dark[7] = $("#colorpicker_conf_ansi_white_dark").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright = []),
                                    (N.color_codes.ansi.bright[0] = $("#colorpicker_conf_ansi_black_bright").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright[1] = $("#colorpicker_conf_ansi_red_bright").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright[2] = $("#colorpicker_conf_ansi_green_bright").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright[3] = $("#colorpicker_conf_ansi_yellow_bright").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright[4] = $("#colorpicker_conf_ansi_blue_bright").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright[5] = $("#colorpicker_conf_ansi_magneta_bright").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright[6] = $("#colorpicker_conf_ansi_cyan_bright").data("kendoColorPicker").value()),
                                    (N.color_codes.ansi.bright[7] = $("#colorpicker_conf_ansi_white_bright").data("kendoColorPicker").value()),
                                !1 === (N = Conf.check(N, !1)))
                            )
                                return;
                            ((i = {}).data = Text.compress(JSON.stringify(Conf.encode(N)))),
                                (i.md5 = md5(i.data)),
                                (i.compressed = !0),
                                (i.type = "conf"),
                                !0 !== Gmcp.send("client.conf.set", JSON.stringify(i))
                                    ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                    : ((Conf.data = N), Conf.refresh(), $("#conf_dialog .change_button").removeClass("k-state-selected"));
                            break;
                        case "button_undo_conf":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            Conf.refresh_conf(), $("#conf_dialog .change_button").removeClass("k-state-selected");
                            break;
                        case "button_help_conf":
                            $("#help_client_dialog").parent().is(":visible") ? $("#help_client_dialog").data("kendoWindow").toFront() : $("#help_client_dialog").data("kendoWindow").center().open(),
                                $("#dropdown_help_client_category").data("kendoDropDownList").value("conf"),
                                Help_client.refresh();
                            break;
                        case "button_add_alias":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            j = $("#listview_aliases_list").data("kendoListView");
                            var M = $("#input_alias_command").val(),
                                L = $("#textarea_alias_replacement").val();
                            (o = $("#notification_game").data("kendoNotification")), (D = !1);
                            if (!M) return $("#input_alias_command").focus(), void o.error("Musisz wprowadziÄ komendÄ wywoĹujÄcÄ alias.");
                            if (M.length > 15) return $("#input_alias_command").focus(), void o.error("Komenda wywoĹujÄca alias nie moĹźe byÄ dĹuĹźsza niĹź 15 znakĂłw.");
                            if (M != Text.filter_alphanumeric(M) || M.indexOf(" ") > -1) return $("#input_alias_command").focus(), void o.error("Komenda wywoĹujÄca alias zawiera niedozwolone znaki.");
                            if (!L) return $("#textarea_alias_replacement").focus(), void o.error("Musisz wprowadziÄ komendy, do ktĂłrych rozwinie siÄ alias.");
                            if (L != Text.filter_multi_alphanumeric(L)) return $("#textarea_alias_replacement").focus(), void o.error("RozwiniÄcie aliasu zawiera niedozwolone znaki.");
                            if (
                                ((L = L.replace(/\r\n/g, "\n")),
                                    $.each($("#listview_aliases_list div"), function (e, a) {
                                        if (j.dataItem($(a)).Command === M) return (D = j.dataItem($(a)).Replacement === L || a), !1;
                                    }),
                                !0 === D)
                            )
                                return $("#textarea_alias_replacement").focus(), void o.error("DokĹadnie taki alias juĹź zostaĹ dodany.");
                            D ? ((j.dataItem($(D)).Replacement = L), j.refresh()) : j.dataSource.add({ Command: M, Replacement: L }), $("#aliases_dialog .change_button").addClass("k-state-selected");
                            break;
                        case "button_save_aliases":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            var N = jQuery.extend(!0, {}, Conf.data),
                                O = $("#listview_aliases_list").data("kendoListView").dataSource.data();
                            if (
                                ((N.aliases = {}),
                                    $.each(O, function (e, a) {
                                        N.aliases[a.Command] = a.Replacement;
                                    }),
                                !1 === (N = Conf.check(N, !1)))
                            )
                                return;
                            ((i = {}).data = Text.compress(JSON.stringify(Conf.encode(N)))),
                                (i.md5 = md5(i.data)),
                                (i.compressed = !0),
                                (i.type = "aliases"),
                                !0 !== Gmcp.send("client.conf.set", JSON.stringify(i))
                                    ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                    : ((Conf.data = N), Conf.refresh(), $("#aliases_dialog .change_button").removeClass("k-state-selected"));
                            break;
                        case "button_undo_aliases":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            Conf.refresh_aliases(), $("#aliases_dialog .change_button").removeClass("k-state-selected");
                            break;
                        case "button_help_aliases":
                            $("#help_client_dialog").parent().is(":visible") ? $("#help_client_dialog").data("kendoWindow").toFront() : $("#help_client_dialog").data("kendoWindow").center().open(),
                                $("#dropdown_help_client_category").data("kendoDropDownList").value("aliases"),
                                Help_client.refresh();
                            break;
                        case "button_add_macro":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            j = $("#listview_macros_list").data("kendoListView");
                            var P = $("#dropdown_macro_key").data("kendoDropDownList");
                            (L = $("#textarea_macro_replacement").val()), (o = $("#notification_game").data("kendoNotification")), (D = !1);
                            if (!P.value()) return P.open(), void o.error("Musisz wybraÄ klawisz wywoĹujÄcy makro.");
                            var F = P.dataItem(P.select()).Key,
                                A = P.dataItem(P.select()).Id,
                                R = P.dataItem(P.select()).Type;
                            if (!L) return $("#textarea_macro_replacement").focus(), void o.error("Musisz wprowadziÄ komendy, ktĂłre zostanÄ wywoĹane przez makro.");
                            if (L != Text.filter_multi_alphanumeric(L)) return $("#textarea_macro_replacement").focus(), void o.error("RozwiniÄcie makra zawiera niedozwolone znaki.");
                            if (
                                ((L = L.replace(/\r\n/g, "\n")),
                                    $.each($("#listview_macros_list div"), function (e, a) {
                                        if (j.dataItem($(a)).Key === F) return (D = j.dataItem($(a)).Replacement === L || a), !1;
                                    }),
                                !0 === D)
                            )
                                return $("#textarea_macro_replacement").focus(), void o.error("DokĹadnie takie makro juĹź zostaĹo dodane.");
                            D ? ((j.dataItem($(D)).Replacement = L), (j.dataItem($(D)).Id = A), (j.dataItem($(D)).Type = R), j.refresh()) : j.dataSource.add({ Key: F, Replacement: L, Id: A, Type: R }),
                                $("#macros_dialog .change_button").addClass("k-state-selected");
                            break;
                        case "button_save_macros":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            (N = jQuery.extend(!0, {}, Conf.data)), (O = $("#listview_macros_list").data("kendoListView").dataSource.data());
                            if (
                                ((N.macros = {}),
                                    $.each(O, function (e, a) {
                                        $.isPlainObject(N.macros[a.Id]) || (N.macros[a.Id] = {}), (N.macros[a.Id][a.Type] = a.Replacement);
                                    }),
                                !1 === (N = Conf.check(N, !1)))
                            )
                                return;
                            ((i = {}).data = Text.compress(JSON.stringify(Conf.encode(N)))),
                                (i.md5 = md5(i.data)),
                                (i.compressed = !0),
                                (i.type = "macros"),
                                !0 !== Gmcp.send("client.conf.set", JSON.stringify(i))
                                    ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                    : ((Conf.data = N), Conf.refresh(), $("#macros_dialog .change_button").removeClass("k-state-selected"));
                            break;
                        case "button_undo_macros":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            Conf.refresh_macros(), $("#macros_dialog .change_button").removeClass("k-state-selected");
                            break;
                        case "button_help_macros":
                            $("#help_client_dialog").parent().is(":visible") ? $("#help_client_dialog").data("kendoWindow").toFront() : $("#help_client_dialog").data("kendoWindow").center().open(),
                                $("#dropdown_help_client_category").data("kendoDropDownList").value("macros"),
                                Help_client.refresh();
                            break;
                        case "button_add_button":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            (j = $("#listview_buttons_list").data("kendoListView")), (r = $("#input_button_command").val());
                            var W = $("#dropdown_button_panel").data("kendoDropDownList").value();
                            (L = $("#textarea_button_replacement").val()), (o = $("#notification_game").data("kendoNotification")), (D = !1);
                            if (!r) return $("#input_button_command").focus(), void o.error("Musisz wprowadziÄ nazwÄ dla przycisku.");
                            if (r.length > 15) return $("#input_button_command").focus(), void o.error("Nazwa przycisku nie moĹźe byÄ dĹuĹźsza niĹź 15 znakĂłw.");
                            if (" " == r.slice(0, 1) || " " == r.slice(-1)) return $("#input_button_command").focus(), void o.error("Nazwa przycisku nie moĹźe zaczynaÄ siÄ lub koĹczyÄ spacjÄ.");
                            if (!W) return $("#dropdown_button_panel").data("kendoDropDownList").open(), void o.error("Musisz wybraÄ panel, w ktĂłrym przycisk bÄdzie umieszczony.");
                            if (!L) return $("#textarea_button_replacement").focus(), void o.error("Musisz wprowadziÄ komendy, ktĂłre zostanÄ wywoĹane przez przycisk.");
                            if (L != Text.filter_multi_alphanumeric(L)) return $("#textarea_button_replacement").focus(), void o.error("RozwiniÄcie makra zawiera niedozwolone znaki.");
                            if (
                                ((r = r.toLowerCase()),
                                    (L = L.replace(/\r\n/g, "\n")),
                                    $.each($("#listview_buttons_list div"), function (e, a) {
                                        if (j.dataItem($(a)).Name === encodeURI(r)) return (D = (j.dataItem($(a)).Replacement === L && j.dataItem($(a)).Panel === W) || a), !1;
                                    }),
                                !0 === D)
                            )
                                return $("#input_button_command").focus(), void o.error("DokĹadnie taki przycisk juĹź zostaĹ dodany.");
                            D ? ((j.dataItem($(D)).Replacement = L), (j.dataItem($(D)).Panel = W), j.refresh()) : j.dataSource.add({ Name: encodeURI(r), Replacement: L, Panel: W }),
                                $("#buttons_dialog .change_button").addClass("k-state-selected");
                            break;
                        case "button_save_buttons":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            (N = jQuery.extend(!0, {}, Conf.data)), (O = $("#listview_buttons_list").data("kendoListView").dataSource.data());
                            if (
                                ((N.buttons = []),
                                    $.each(O, function (e, a) {
                                        var t = {};
                                        (t.Name = a.Name), (t.Replacement = a.Replacement), (t.Panel = a.Panel), N.buttons.push(t);
                                    }),
                                !1 === (N = Conf.check(N, !1)))
                            )
                                return;
                            ((i = {}).data = Text.compress(JSON.stringify(Conf.encode(N)))),
                                (i.md5 = md5(i.data)),
                                (i.compressed = !0),
                                (i.type = "buttons"),
                                !0 !== Gmcp.send("client.conf.set", JSON.stringify(i))
                                    ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                    : ((Conf.data = N), Conf.refresh(), $("#buttons_dialog .change_button").removeClass("k-state-selected"));
                            break;
                        case "button_undo_buttons":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            Conf.refresh_buttons(), $("#buttons_dialog .change_button").removeClass("k-state-selected");
                            break;
                        case "button_help_buttons":
                            $("#help_client_dialog").parent().is(":visible") ? $("#help_client_dialog").data("kendoWindow").toFront() : $("#help_client_dialog").data("kendoWindow").center().open(),
                                $("#dropdown_help_client_category").data("kendoDropDownList").value("buttons"),
                                Help_client.refresh();
                            break;
                        case "button_add_action":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            (j = $("#listview_actions_list").data("kendoListView")), (r = $("#input_action_command").val());
                            var B = jQuery.extend(!0, [], $("#multiselect_action_char_type").data("kendoMultiSelect").value()),
                                H = $("#dropdown_action_team_role").data("kendoDropDownList").value();
                            (L = $("#textarea_action_replacement").val()), (o = $("#notification_game").data("kendoNotification")), (D = !1);
                            if (!r) return $("#input_action_command").focus(), void o.error("Musisz wprowadziÄ nazwÄ dla akcji.");
                            if (r.length > 15) return $("#input_action_command").focus(), void o.error("Nazwa akcji nie moĹźe byÄ dĹuĹźsza niĹź 15 znakĂłw.");
                            if (" " == r.slice(0, 1) || " " == r.slice(-1)) return $("#input_action_command").focus(), void o.error("Nazwa akcji nie moĹźe zaczynaÄ siÄ lub koĹczyÄ spacjÄ.");
                            if (!L) return $("#textarea_action_replacement").focus(), void o.error("Musisz wprowadziÄ komendy, ktĂłre zostanÄ wywoĹane przez akcjÄ.");
                            if (L != Text.filter_multi_alphanumeric(L)) return $("#textarea_action_replacement").focus(), void o.error("RozwiniÄcie akcji zawiera niedozwolone znaki.");
                            if (!H) return $("#dropdown_action_team_role").data("kendoDropDownList").open(), void o.error("Musisz wybraÄ dla jakiej roli twojej postaci w druĹźynie akcja bÄdzie dostÄpna.");
                            if (
                                ((r = r.toLowerCase()),
                                    (L = L.replace(/\r\n/g, "\n")),
                                    B.sort(),
                                    $.each($("#listview_actions_list div"), function (e, a) {
                                        if (j.dataItem($(a)).Name === encodeURI(r))
                                            return (
                                                (D =
                                                    (j.dataItem($(a)).Replacement === L &&
                                                        j.dataItem($(a)).Team_Role === H &&
                                                        j.dataItem($(a)).Char_Type.length == B.length &&
                                                        !j.dataItem($(a)).Char_Type.filter(function (e, a, t) {
                                                            if (B[a] !== e) return !0;
                                                        }).length) ||
                                                    a),
                                                    !1
                                            );
                                    }),
                                !0 === D)
                            )
                                return $("#input_action_command").focus(), void o.error("DokĹadnie taka akcja juĹź zostaĹa dodana.");
                            D ? ((j.dataItem($(D)).Replacement = L), (j.dataItem($(D)).Char_Type = B), (j.dataItem($(D)).Team_Role = H), j.refresh()) : j.dataSource.add({ Name: encodeURI(r), Replacement: L, Char_Type: B, Team_Role: H }),
                                $("#actions_dialog .change_button").addClass("k-state-selected");
                            break;
                        case "button_save_actions":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            (N = jQuery.extend(!0, {}, Conf.data)), (O = $("#listview_actions_list").data("kendoListView").dataSource.data());
                            if (
                                ((N.actions = []),
                                    $.each(O, function (e, a) {
                                        var t = {};
                                        (t.Name = a.Name), (t.Replacement = a.Replacement), (t.Char_Type = jQuery.extend(!0, [], a.Char_Type)), (t.Team_Role = a.Team_Role), N.actions.push(t);
                                    }),
                                !1 === (N = Conf.check(N, !1)))
                            )
                                return;
                            ((i = {}).data = Text.compress(JSON.stringify(Conf.encode(N)))),
                                (i.md5 = md5(i.data)),
                                (i.compressed = !0),
                                (i.type = "actions"),
                                !0 !== Gmcp.send("client.conf.set", JSON.stringify(i))
                                    ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                    : ((Conf.data = N), Conf.refresh(), $("#actions_dialog .change_button").removeClass("k-state-selected"));
                            break;
                        case "button_undo_actions":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            Conf.refresh_actions(), $("#actions_dialog .change_button").removeClass("k-state-selected");
                            break;
                        case "button_help_actions":
                            $("#help_client_dialog").parent().is(":visible") ? $("#help_client_dialog").data("kendoWindow").toFront() : $("#help_client_dialog").data("kendoWindow").center().open(),
                                $("#dropdown_help_client_category").data("kendoDropDownList").value("actions"),
                                Help_client.refresh();
                            break;
                        case "button_add_pattern":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            j = $("#listview_patterns_list").data("kendoListView");
                            var G = $("#input_pattern_regexp").val(),
                                V = parseInt($("#dropdown_pattern_replacement_flag").data("kendoDropDownList").value()),
                                E = ((L = $("#input_pattern_replacement").val()), parseInt($("#dropdown_pattern_color_flag").data("kendoDropDownList").value())),
                                U = $("#colorpicker_pattern_color").data("kendoColorPicker").value(),
                                Q = parseInt($("#dropdown_pattern_sound_flag").data("kendoDropDownList").value()),
                                K = parseInt($("#dropdown_pattern_sound").data("kendoDropDownList").value());
                            (o = $("#notification_game").data("kendoNotification")), (D = !1);
                            if (!G) return $("#input_pattern_regexp").focus(), void o.error("Musisz wprowadziÄ wyraĹźenie regularne bÄdÄce wzorcem do wyszukiwania tekstu.");
                            if (G != Text.filter_alphanumeric(G)) return $("#input_pattern_regexp").focus(), void o.error("Wzorzec tekstu zawiera niedozwolone znaki.");
                            try {
                                new RegExp(G);
                            } catch (e) {
                                return $("#input_pattern_regexp").focus(), void o.error("Wzorzec tekstu nie jest poprawnym wyraĹźeniem regularnym. ZgĹoszony bĹÄd: " + e);
                            }
                            if (1 != V && 1 != E && 1 != Q) return void o.error("Musisz wybraÄ czy tekst pasujÄcy do wzorca ma zostaÄ zmieniony, pokolorowany czy teĹź wywoĹaÄ jakiĹ dĹşwiÄk.");
                            if (1 == V && L != Text.filter_alphanumeric(L)) return $("#input_pattern_replacement").focus(), void o.error("Zmieniony tekst zawiera niedozwolone znaki.");
                            if (1 == E && !U) return $("#colorpicker_pattern_color").data("kendoColorPicker").open(), void o.error("Musisz wybraÄ jaki kolor ma mieÄ tekstu pasujÄcy do wzorca tekstu.");
                            if (1 == E && !/^#(?:[A-Fa-f0-9]{3}){1,2}$/.test(U)) return $("#colorpicker_pattern_color").data("kendoColorPicker").open(), void o.error("Musisz wybraÄ kolor w formacie RGB.");
                            if (1 == Q && !K) return $("#dropdown_pattern_sound").data("kendoDropDownList").open(), void o.error("Musisz wybraÄ sposĂłb modyfikacji tekstu lub dĹşwiÄk jaki ma on wywoĹaÄ.");
                            if (1 == E && 1 == V && !L.length) return $("#input_pattern_replacement").focus(), void o.error("Nie moĹźesz zmieniaÄ tekstu na pusty i jednoczeĹnie go kolorowaÄ.");
                            if (
                                ($.each($("#listview_patterns_list div"), function (e, a) {
                                    if (j.dataItem($(a)).Regexp === G)
                                        return (
                                            (D =
                                                (((1 == Q && j.dataItem($(a)).Sound === K) || (2 == Q && void 0 === j.dataItem($(a)).Sound)) &&
                                                    ((1 == E && j.dataItem($(a)).Color === U) || (2 == E && void 0 === j.dataItem($(a)).Color)) &&
                                                    ((1 == V && j.dataItem($(a)).Replacement === L) || (2 == V && void 0 === j.dataItem($(a)).Replacement))) ||
                                                a),
                                                !1
                                        );
                                }),
                                !0 === D)
                            )
                                return $("#input_pattern_regexp").focus(), void o.error("DokĹadnie taki wzorzec tekstu juĹź zostaĹ dodany.");
                            if (D)
                                1 == V ? (j.dataItem($(D)).Replacement = L) : delete j.dataItem($(D)).Replacement,
                                    1 == E && U ? (j.dataItem($(D)).Color = U) : delete j.dataItem($(D)).Color,
                                    1 == Q && K ? (j.dataItem($(D)).Sound = K) : delete j.dataItem($(D)).Sound,
                                    j.refresh();
                            else {
                                var Z = {};
                                1 == V && (Z.Replacement = L), 1 == E && U && (Z.Color = U), 1 == Q && K && (Z.Sound = K), (Z.Regexp = G), j.dataSource.add(Z);
                            }
                            $("#patterns_dialog .change_button").addClass("k-state-selected");
                            break;
                        case "button_save_patterns":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zapis konfiguracji jest moĹźliwy tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            (N = jQuery.extend(!0, {}, Conf.data)), (O = $("#listview_patterns_list").data("kendoListView").dataSource.data());
                            if (
                                ((N.patterns = []),
                                    $.each(O, function (e, a) {
                                        var t = {};
                                        (t.Regexp = a.Regexp), "string" == typeof a.Replacement && (t.Replacement = a.Replacement), a.Color && (t.Color = a.Color), a.Sound && (t.Sound = a.Sound), N.patterns.push(t);
                                    }),
                                !1 === (N = Conf.check(N, !1)))
                            )
                                return;
                            ((i = {}).data = Text.compress(JSON.stringify(Conf.encode(N)))),
                                (i.md5 = md5(i.data)),
                                (i.compressed = !0),
                                (i.type = "patterns"),
                                !0 !== Gmcp.send("client.conf.set", JSON.stringify(i))
                                    ? $("#notification_game").data("kendoNotification").error("Konfiguracja jest zbyt dĹuga, by mogĹa zostaÄ poprawnie zapisana.")
                                    : ((Conf.data = N), Conf.refresh(), $("#patterns_dialog .change_button").removeClass("k-state-selected"));
                            break;
                        case "button_undo_patterns":
                            if (null == Client.socket) return void $("#notification_game").data("kendoNotification").error("Zmiany konfiguracji sÄ moĹźliwe tylko przy aktywnym poĹÄczeniu z ArkadiÄ.");
                            Conf.refresh_patterns(), $("#patterns_dialog .change_button").removeClass("k-state-selected");
                            break;
                        case "button_help_patterns":
                            $("#help_client_dialog").parent().is(":visible") ? $("#help_client_dialog").data("kendoWindow").toFront() : $("#help_client_dialog").data("kendoWindow").center().open(),
                                $("#dropdown_help_client_category").data("kendoDropDownList").value("patterns"),
                                Help_client.refresh();
                    }
                },
            }),
            $(".listview").scroll(function () {
                Scroller.check_down(this) && this.scrollHeight >= this.offsetHeight ? $(this).addClass("listview_scrolled_down") : $(this).removeClass("listview_scrolled_down");
            }),
            $(".text_output").scroll(function () {
                Scroller.check_down(this) && $(this).removeClass("k-state-selected");
            }),
            $(".k-textbox, .k-button").on("focus", function () {
                $(this).addClass("k-state-active");
            }),
            $(".k-textbox, .k-button").on("blur", function () {
                $(this).removeClass("k-state-active");
            }),
            $(o).on("focus click", function (e) {
                Scroller.move_down(Output.element);
            }),
            $(o).on("input", function (e) {
                var a = Input.element,
                    t = a.value.split(/\n/);
                if (t.length > 1) {
                    var o = t.pop();
                    $.each(t, function (e, t) {
                        (a.value = t), Input.process_input();
                    }),
                        (a.value = o),
                        a.setSelectionRange(o.length, o.length);
                }
                Input.set_color();
            }),
            $("input, select, textarea").attr("autocomplete", "off").attr("autocorrect", "off").attr("autocapitalize", "none").attr("spellcheck", "false"),
            Help_mud.load(),
            Maps.unset_position(),
            Client.connect();
    });
