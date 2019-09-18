from django.shortcuts import render, render_to_response, HttpResponse, HttpResponseRedirect
from cmdb.models.bookmarkmodels import Bookmark
import json


def bookmarkAdd(requests):
    if requests.method == 'POST':
        title = requests.POST['title']
        url = requests.POST['url']
        desc = requests.POST['desc']
        print(title, url, desc)
        bookmark = Bookmark.objects.create(title=title, url=url, desc=desc)
        data = [{"id": bookmark.id,
                 "title": bookmark.title,
                 "url": bookmark.url,
                 "desc": bookmark.desc
                 }]
        return HttpResponse(json.dumps(data))
    else:
        return HttpResponse("erro")


def bookmarkDel(requests):
    id = requests.POST['id']
    bookmark = Bookmark.objects.filter(id=id)
    title = bookmark[0].title
    bookmark.delete()
    return HttpResponse(title)


def bookmarksGet(requests):

    bookmakrs = Bookmark.objects.all()
    data = list()
    if len(bookmakrs) != 0:
        for bm in bookmakrs:
            data.append({
                "id": bm.id,
                "title": bm.title,
                "url": bm.url,
                "desc": bm.desc
            })
        return HttpResponse(json.dumps(data))
    else:
        return HttpResponse("null")
