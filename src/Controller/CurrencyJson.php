<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class CurrencyJson
{
    private $curKey = [
        'ERO' => 'R01239',
        'USD' => 'R01235'
    ];

    function getCurrencyFromDataRange($date1, $date2, $currency) {
        try {
            $xmlstr = file_get_contents("http://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=$date1&date_req2=$date2&VAL_NM_RQ=$currency");
        } catch (\Exception $ex) {
            return [];
        }
        $xml = new \SimpleXMLElement($xmlstr);
        $arCurrencyValue = [];
        foreach ($xml->Record as $rec) {
            $strVal = strval($rec->Value);
            $strVal = str_replace(',', '.', $strVal);
            $strDate = strval($rec['Date']);
            $arDate = explode('.', $strDate);
            $arCurrencyValue[] = [
                'val' => doubleval($strVal),
                'date' => [
                    'day' => $arDate[0],
                    'month' => $arDate[1],
                    'year' => $arDate[2],
                ]
            ];
        }
        return $arCurrencyValue;
    }

    function getJsonCurrencyUsdEur(Request $req) {
        $date1 = $req->query->get('date1');
        $date2 = $req->query->get('date2');
        $currency = $req->query->get('cur');
        $result = [];

        foreach($currency as $cur) {
            $res = $this->getCurrencyFromDataRange($date1, $date2, $this->curKey[$cur]);
            if (!empty($res)) {
                $result[$cur] = $res;
            }
        }

        $response = new Response(json_encode($result));
        $response->headers->set('Content-Type', 'application/json');

        return $response;
    }
}