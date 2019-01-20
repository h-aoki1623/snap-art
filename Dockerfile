# Dockerfile for SnapArt Rails Server

FROM ubuntu:18.04

MAINTAINER Hirofumi Aoki

CMD ["/bin/bash"]
SHELL ["/bin/bash", "-c"]
ENV DEBIAN_FRONTEND=noninteractive

# Update apt
RUN apt-get update

# Install packages
RUN apt-get -y install \
    git \
    gcc \
    build-essential \
    libreadline-dev \
    zlib1g-dev \
    libssl-dev \
    sudo \
    vim \
    systemd \
    iputils-ping \
    net-tools
RUN apt-get -y install \
    sqlite3 \
    libsqlite3-dev \
    nodejs \
    gem \
    nginx-full
RUN apt-get -y install curl


# Make application directory
RUN mkdir /var/www/webapp
RUN chown root:www-data /var/www/webapp
RUN chmod g+w /var/www/webapp


# Add users
RUN echo 'root:passwd' | chpasswd
RUN useradd -g sudo -m -s /bin/bash appuser && \
    echo 'appuser:passwd' | chpasswd
RUN useradd -g www-data -m -s /bin/bash webmaster && \
    echo 'webmaster:passwd' | chpasswd


USER webmaster

# Install rbenv
RUN git clone https://github.com/sstephenson/rbenv.git ~/.rbenv
RUN echo $HOME
ENV PATH /home/webmaster/.rbenv/shims:/home/webmaster/.rbenv/bin:$PATH
RUN echo $PATH
RUN echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
RUN cd ~
RUN ["/bin/bash", "-c", " \
        source ~/.bash_profile \
    "]

# Install ruby
RUN git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
RUN rbenv install --list
RUN rbenv install 2.6.0
RUN rbenv global 2.6.0

RUN echo $PATH

# Install bundler
RUN gem install bundler

# Install rails
RUN gem install rails --no-document


EXPOSE 80
