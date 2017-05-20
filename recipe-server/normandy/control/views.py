from django.conf import settings
from django.shortcuts import render, redirect


def IndexView(request):
    if not request.user.is_authenticated():
        return redirect('%s?next=%s' % ('/control/login/', request.path))
    else:
        return render(request, 'control/index.html', {
            'PEER_APPROVAL_ENFORCED': settings.PEER_APPROVAL_ENFORCED,
        })


def IndexView2(request):
    if not request.user.is_authenticated():
        return redirect('%s?next=%s' % ('/control2/login/', request.path))
    else:
        return render(request, 'control2/index.html', {
            'PEER_APPROVAL_ENFORCED': settings.PEER_APPROVAL_ENFORCED,
        })
