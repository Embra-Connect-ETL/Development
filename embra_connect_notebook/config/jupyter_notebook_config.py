# Date Mofied -> 2/1/24
c.ServerApp.tornado_settings = {
    'headers': {
        'Content-Security-Policy': "frame-ancestors 'self' http://localhost:5500"
    }
}

c.ServerApp.extra_static_paths = ['/home/jovyan/.jupyter/custom/', '/opt/conda/lib/python3.11/site-packages/notebook/custom/custom.css']

c.ServerApp.token = ''
c.ServerApp.password = u''
c.ServerApp.ip = 'localhost'