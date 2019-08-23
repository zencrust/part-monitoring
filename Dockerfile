from nginx:1.17.1-alpine
COPY ./build /var/www/partalarm
COPY nginx/ /etc/nginx/
RUN ln -nfs /etc/nginx/sites-available/partalarm.zencrust.cf.conf /etc/nginx/sites-enabled/partalarm.zencrust.cf.conf
EXPOSE 80 443

ENTRYPOINT ["nginx","-g","daemon off;"]
