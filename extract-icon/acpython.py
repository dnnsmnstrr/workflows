#!/usr/bin/python

# unicode: UTF-8

import sys

qr = sys.argv[1]
argument = sys.argv[2]

if argument == '--list':

    import urllib, json, re

    #####################

    COUNTRY = 'pl'      # specify the ISO Country code for results from your country (URL as well as price)
    LIMIT = 20          # the limit of displayed apps

    #####################

    def lookup(query, country=COUNTRY):
        appid = re.search('(^.*/id)([0-9]*)(\?.*$)', query).group(2)
        dictionary = urllib.urlopen('https://itunes.apple.com/lookup?id=' + appid + '&country' + country).read()
        return json.loads(dictionary)

    def results(query, media='software', country=COUNTRY, entity='software,iPadSoftware,macSoftware', limit=LIMIT):
        query = urllib.quote_plus(query)
        dictionary = urllib.urlopen('https://itunes.apple.com/search?term='+ query + '&country=' + country + '&entity=' + entity + '&limit=' + str(limit) + '&media=' + media).read()
        return json.loads(dictionary)

    def device(item):
        if item['kind'] == 'software':
            return 'iOS'
        elif item['kind'] == 'mac-software':
            return 'OSX'

    def loop(item, num):
        for i in range (0,num):
            print '<item>'
            print '<arg><![CDATA[' + item[i]['artworkUrl512'].encode('utf-8') + '^' + item[i]['trackName'].encode('utf-8') + '^' + device(item[i]) + ']]></arg>'
            print '<title><![CDATA[' + item[i]['trackName'].encode('utf-8') + ']]></title>'
            print '<subtitle><![CDATA[', item[i]['formattedPrice'].encode('utf-8'), '| by:', item[i]['sellerName'].encode('utf-8'), ']]></subtitle>'
            print '</item>'

    if qr.startswith("http"):
        appsearch = lookup(qr)
    else:
        appsearch = results(qr)

    number = appsearch['resultCount']

    print '<?xml version="1.0"?><items>'

    if number == 0:
        print '<item><title>Couldn\'t find any apps</title></item>'
    else:
        item = appsearch['results']
        loop(item, number)

    print '</items>'

elif argument =='--local':
    import json
    from subprocess import Popen, PIPE

    nameof = sys.argv[3]

    def plist_to_dictionary(filename):
        "Pipe the binary plist through plutil and parse the JSON output"
        with open(filename, "rb") as f:
            content = f.read()
        args = ["plutil", "-convert", "json", "-o", "-", "--", "-"]
        p = Popen(args, stdin=PIPE, stdout=PIPE)
        p.stdin.write(content)
        out, err = p.communicate()
        return json.loads(out)

    if nameof == '--icon':
        print plist_to_dictionary(qr)['CFBundleIconFile']
    elif nameof == '--name':
        print plist_to_dictionary(qr)['CFBundleExecutable']

elif argument == '--mask':
    try:
        from PIL import Image, ImageOps

        im = Image.open(qr)

        w, h = im.size

        if w == 512:
            mask = Image.open('mask512.png').convert('L')
        else:
            mask = Image.open('mask.png').convert('L')
        
        output = ImageOps.fit(im, mask.size, centering=(0.5,0.5))
        output.putalpha(mask)
        output.save(qr)
    except Exception:
        pass

    print qr