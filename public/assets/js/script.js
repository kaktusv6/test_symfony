var curDate = new Date();

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

$(document).ready(function () {
    // Добавляем дефолтные значения
    var valForInputDate1 = curDate.getFullYear() + '-' + ('0' + (curDate.getMonth()+1)).slice(-2) + '-' + ('0' + (curDate.getDate() - 10) % 30).slice(-2);
    var valForInputDate2 = curDate.getFullYear() + '-' + ('0' + (curDate.getMonth()+1)).slice(-2) + '-' + ('0' + curDate.getDate()).slice(-2);

    $('#date-input-1').val(valForInputDate1);
    $('#date-input-2').val(valForInputDate2);

    // Формируем ajax запрос при нажатии на кнопку
    $('.btn').click(function () {
        $('.alert').hide();
        $('#chart_div').hide();
        $('.preloader').show();
        let dataInput1 = $('#date-input-1').val().split('-');
        let dataInput2 = $('#date-input-2').val().split('-');

        let getQuery = '?date1=' + ('0' + parseInt(dataInput1[2])).slice(-2) + '/'
            + ('0' + (parseInt(dataInput1[1]))).slice(-2) + '/'
            + parseInt(dataInput1[0]);
        getQuery += '&date2=' + ('0' + parseInt(dataInput2[2])).slice(-2) + '/'
            + ('0' + (parseInt(dataInput2[1]))).slice(-2) + '/'
            + parseInt(dataInput2[0]);
        getQuery += '&cur[]=USD&cur[]=ERO';

        console.log(getQuery);
        $.ajax({
            url: '/json/currency/' + getQuery,
            type: 'get',
            dataType: 'json',
            success: function (data) {
                if (isEmpty(data)) {
                    $('.preloader').hide();
                    $('.alert').show();
                    return;
                }
                let val = [];

                for(let i = 0; i < data.ERO.length; i++) {
                    let usd = data.USD[i];
                    let ero = data.ERO[i];
                    let date = new Date(usd.date.year, usd.date.month, usd.date.day);
                    val.push([date, usd.val, ero.val]);
                }
                drawChart(val);
            }
        });
    });

    // Подгружаем графики
    google.charts.load('current', {'packages':['line', 'corechart']});
});

// Метод прорисовки графика
function drawChart(rows) {
    var chartDiv = document.getElementById('chart_div');

    var data = new google.visualization.DataTable();
    data.addColumn('date', 'Дата');

    data.addColumn('number', "USD");
    data.addColumn('number', "ERO");

    data.addRows(rows);

    var materialOptions = {
        chart: {
            title: 'Курс валют на ' + $('#date-input-1').val() + ' - ' + $('#date-input-2').val()
        },
        width: 1170,
        height: 500,
        axes: {
            // Adds labels to each axis; they don't have to match the axis names.
            y: {
                RUB: {label: 'RUB'},
            }
        }
    };

    var materialChart = new google.charts.Line(chartDiv);
    materialChart.draw(data, materialOptions);
    $('.preloader').hide();
    $('#chart_div').show();
}