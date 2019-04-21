FROM postgres:10.1-alpine
RUN apk add --update iputils
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
USER postgres
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["postgres"]
