FROM rabbitmq:3.8
LABEL maintainer="Gary Ascuy <gary.ascuy@gmail.com>"

ENV RABBITMQ_DEFAULT_USER admin
ENV RABBITMQ_DEFAULT_PASS admin

RUN rabbitmq-plugins enable --offline rabbitmq_management
RUN rabbitmq-plugins enable --offline rabbitmq_mqtt
RUN rabbitmq-plugins enable --offline rabbitmq_web_mqtt

# Admin Port: 15672, WS MQTT Port: 15675
EXPOSE 5672 15675 1883 15672
