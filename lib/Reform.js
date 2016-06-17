/*
 * Copyright (c) 2005-2006 Michael Eddington
 * Copyright (c) 2004 IOActive Inc. 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy  
 * of this software and associated documentation files (the "Software"), to deal 
 * in the Software without restriction, including without limitation the rights  
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
 * copies of the Software, and to permit persons to whom the Software is  
 * furnished to do so, subject to the following conditions: 
 * 
 * The above copyright notice and this permission notice shall be included in  
 * all copies or substantial portions of the Software. 
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
 * SOFTWARE. 
 * 
 * Authors:
 *   Michael Eddington (meddington@phed.org)
 *
 * $Id$
 */

App.Reform = {};

App.Reform.HtmlEncode = function ($str, $default) {
    if ($str == null || $str.length == 0) {
        $str = ($default == null ? '' : $default);
    }

    $out = '';
    $len = $str.length;

    // Allow: a-z A-Z 0-9 SPACE , .
    // Allow (dec): 97-122 65-90 48-57 32 44 46

    for ($cnt = 0; $cnt < $len; $cnt++) {
        $c = $str.charCodeAt($cnt);
        if (($c >= 97 && $c <= 122) ||
            ($c >= 65 && $c <= 90 ) ||
            ($c >= 48 && $c <= 57 ) ||
            $c == 32 || $c == 44 || $c == 46) {
            $out += $str.charAt($cnt);
        }
        else {
            $out += '&#' + $c + ';';
        }
    }

    return $out;
};

App.Reform.HtmlAttributeEncode = function ($str, $default) {
    if ($str == null || $str.length == 0) {
        $str = ($default == null ? '' : $default);
    }

    $out = '';
    $len = $str.length;

    // Allow: a-z A-Z 0-9
    // Allow (dec): 97-122 65-90 48-57

    for ($cnt = 0; $cnt < $len; $cnt++) {
        $c = $str.charCodeAt($cnt);
        if (($c >= 97 && $c <= 122) ||
            ($c >= 65 && $c <= 90 ) ||
            ($c >= 48 && $c <= 57 )) {
            $out += $str.charAt($cnt);
        }
        else {
            $out += '&#' + $c + ';';
        }
    }

    return $out;
};

App.Reform.XmlEncode = function ($str, $default) {
    return App.Reform.HtmlEncode($str, $default);
};

App.Reform.XmlAttributeEncode = function ($str, $default) {
    return App.Reform.HtmlAttributeEncode($str, $default);
};

var hD = "0123456789ABCDEF";
function d2h(d) {
    var h = hD.substr(d & 15, 1);
    while (d > 15) {
        d >>= 4;
        h = hD.substr(d & 15, 1) + h;
    }

    return h;
}

function JsString($str, $default) {
    if ($str == null || $str.length == 0) {
        $str = ($default == null ? '' : $default);

        if ($str == null || $str.length == 0) {
            return '\'\'';
        }
    }

    $out = '\'';
    $len = $str.length;

    // Allow: a-z A-Z 0-9 SPACE , .
    // Allow (dec): 97-122 65-90 48-57 32 44 46

    for ($cnt = 0; $cnt < $len; $cnt++) {
        $c = $str.charCodeAt($cnt);
        if (($c >= 97 && $c <= 122) ||
            ($c >= 65 && $c <= 90 ) ||
            ($c >= 48 && $c <= 57 ) ||
            $c == 32 || $c == 44 || $c == 46) {
            $out += $str.charAt($cnt);
        }
        else if ($c <= 127) {
            $hex = d2h($c);
            if ($hex.length < 2) {
                '0' + $hex;
            }

            $out += '\\x' + $hex;
        }
        else {
            $hex = d2h($c);
            while ($hex.length < 4) {
                $hex = '0' + $hex;
            }

            $out += '\\u' + $hex;
        }
    }

    return $out + '\'';
}

function VbsString($str, $default) {
    if ($str == null || $str.legnth == 0) {
        $str = ($default == null ? '' : $default);

        if ($str == null || $str.length == 0) {
            return '""';
        }
    }

    $out = '';
    $inStr = 0;
    $len = $str.length;

    // Allow: a-z A-Z 0-9 SPACE , .
    // Allow (dec): 97-122 65-90 48-57 32 44 46

    for ($cnt = 0; $cnt < $len; $cnt++) {
        $c = $str.charCodeAt($cnt);
        if (($c >= 97 && $c <= 122) ||
            ($c >= 65 && $c <= 90 ) ||
            ($c >= 48 && $c <= 57 ) ||
            $c == 32 || $c == 44 || $c == 46) {
            if ($inStr == 0) {
                $inStr = 1;
                $out += '&"';
            }

            $out += $str.charAt($cnt);
        }
        else {
            if ($inStr == 0) {
                $out += '&chrw(' + $c + ')';
            }
            else {
                $out += '"&chrw(' + $c + ')';
                $inStr = 0;
            }
        }
    }

    if ($out.charAt(0) == '&') {
        $out = $out.substr(1);
    }

    return $out + ($inStr == 1 ? '"' : '');
}

// end