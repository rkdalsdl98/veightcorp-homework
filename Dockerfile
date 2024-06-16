FROM node:20

WORKDIR /usr/src/app/

RUN apt-get update; \
		apt-get install -y apt-utils redis-server nano curl git locales;

# 언어 추가

RUN localedef -i ko_KR -f UTF-8 ko_KR.UTF-8
RUN localedef -i en_US -f UTF-8 en_US.UTF-8
ENV LANG en_US.utf8

# 깃 허브 연동

RUN git remote add origin https://github.com/rkdalsdl98/veightcorp-homework.git
RUN git pull origin main

# 컨테이너 로드 중 실행 될 기타 명령어

RUN npm install
RUN npm run build

RUN npx prisma generate