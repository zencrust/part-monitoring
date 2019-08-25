from arm32v7/nginx:1.17.3
COPY ./build /var/www/partalarm
COPY nginx/ /etc/nginx/
RUN nginx/sites-available/partalarm.zencrust.cf.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443

ENTRYPOINT ["nginx","-g","daemon off;"]
