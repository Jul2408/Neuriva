from rest_framework.throttling import AnonRateThrottle

class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'

class GoogleAuthThrottle(AnonRateThrottle):
    rate = '10/min'
