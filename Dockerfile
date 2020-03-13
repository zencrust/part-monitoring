from node:8-buster as multistage
COPY . .
RUN yarn install && yarn build


from nginx:1.17.9
COPY --from=multistage /build /var/www/partalarm
COPY nginx/ /etc/nginx/
RUN nginx/sites-available/partalarm.zencrust.cf.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443

ENTRYPOINT ["nginx","-g","daemon off;"]
